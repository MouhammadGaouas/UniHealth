import { prisma } from '@/lib/prisma';
import {
    createOrganizationSchema,
    addOrganizationLocationSchema,
    addOrganizationDoctorSchema,
    assignResourceSchema
} from '@/lib/schemas';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { getOrganizationMetrics } from '@/lib/analytics';
import { enforceLocationLimit, enforceDoctorLimit } from '@/lib/subscription-limits';

export class OrganizationService {
    /**
     * Get an organization by user ID
     */
    async getByUserId(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { organizationId: true }
        });

        if (!user || !user.organizationId) {
            throw new Error("User does not belong to an organization");
        }

        return prisma.organization.findUnique({
            where: { id: user.organizationId },
            include: {
                _count: { select: { doctors: true, locations: true } },
                subscription: {
                    select: { planTier: true, status: true, updatedAt: true }
                }
            }
        });
    }

    /**
     * Create a new organization and make the creator an ORG_ADMIN
     */
    async createOrganization(userId: string, data: z.infer<typeof createOrganizationSchema>) {
        const { name, type } = createOrganizationSchema.parse(data);

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error("User not found");
        if (user.role === 'DOCTOR' || user.role === 'ADMIN') {
            throw new Error("Doctors and System Admins cannot create organizations. Please use a separate account.");
        }

        return prisma.$transaction(async (tx) => {
            const org = await tx.organization.create({
                data: { name, type }
            });

            // Default STARTER subscription
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1);

            await tx.subscription.create({
                data: {
                    organizationId: org.id,
                    planTier: 'STARTER',
                    status: 'ACTIVE',
                    billingCycle: 'MONTHLY'
                }
            });

            await tx.user.update({
                where: { id: userId },
                data: { role: 'ORG_ADMIN', organizationId: org.id }
            });

            return org;
        });
    }

    /**
     * Get team members (doctors)
     */
    async getTeam(organizationId: string) {
        return prisma.doctor.findMany({
            where: { organizationId },
            include: {
                user: { select: { id: true, name: true, email: true, phoneNumber: true } },
                location: { select: { name: true } },
                _count: { select: { appointments: true } }
            }
        });
    }

    /**
     * Add a new doctor to the organization team
     */
    async addDoctor(organizationId: string, data: z.infer<typeof addOrganizationDoctorSchema>) {
        const { email, name, specialty } = addOrganizationDoctorSchema.parse(data);

        await enforceDoctorLimit(organizationId);

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            if (existingUser.role === 'DOCTOR') throw new Error("User is already a doctor");
            if (existingUser.organizationId && existingUser.organizationId !== organizationId) {
                throw new Error("User belongs to another organization");
            }
        }

        return prisma.$transaction(async (tx) => {
            let user = existingUser;

            if (!user) {
                const hashedPassword = await bcrypt.hash('password123', 10);
                user = await tx.user.create({
                    data: {
                        email, name, role: 'DOCTOR', organizationId,
                        emailVerified: true,
                    }
                });

                // Better-auth compatibility
                await tx.account.create({
                    data: {
                        userId: user.id, accountId: email, providerId: 'credential',
                        password: hashedPassword,
                    }
                });
            } else {
                user = await tx.user.update({
                    where: { id: user.id },
                    data: { role: 'DOCTOR', organizationId }
                });
            }

            const doctor = await tx.doctor.create({
                data: {
                    userId: user.id,
                    organizationId,
                    specialty,
                    appointmentTypes: {
                        create: [
                            { name: "General Consultation", duration: 30, price: 50 },
                            { name: "Follow-up", duration: 15, price: 30 }
                        ]
                    }
                },
                include: { user: { select: { id: true, name: true, email: true } } }
            });

            return doctor;
        });
    }

    /**
     * Remove doctor from organization
     */
    async removeDoctor(organizationId: string, doctorId: string) {
        const doctor = await prisma.doctor.findUnique({
            where: { id: doctorId },
            include: { _count: { select: { appointments: { where: { status: { in: ['PENDING', 'CONFIRMED'] } } } } } }
        });

        if (!doctor || doctor.organizationId !== organizationId) {
            throw new Error("Doctor not found in this organization");
        }

        if (doctor._count.appointments > 0) {
            throw new Error("Cannot remove doctor with active upcoming appointments");
        }

        return prisma.$transaction([
            prisma.doctor.delete({ where: { id: doctorId } }),
            prisma.user.update({
                where: { id: doctor.userId },
                data: { role: "PATIENT", organizationId: null }
            })
        ]);
    }

    /**
     * Get organization locations
     */
    async getLocations(organizationId: string) {
        return prisma.location.findMany({
            where: { organizationId, isActive: true },
            include: {
                _count: { select: { doctors: true, appointments: true } }
            }
        });
    }

    /**
     * Add a new location
     */
    async addLocation(organizationId: string, data: z.infer<typeof addOrganizationLocationSchema>) {
        const locationData = addOrganizationLocationSchema.parse(data);
        await enforceLocationLimit(organizationId);

        return prisma.location.create({
            data: { ...locationData, organizationId, isActive: true }
        });
    }

    /**
     * Deactivate location
     */
    async deactivateLocation(organizationId: string, locationId: string) {
        const location = await prisma.location.findUnique({
            where: { id: locationId },
            include: { _count: { select: { doctors: true, appointments: { where: { status: { in: ['PENDING', 'CONFIRMED'] } } } } } }
        });

        if (!location || location.organizationId !== organizationId) {
            throw new Error("Location not found in this organization");
        }

        if (location._count.appointments > 0) {
            throw new Error("Cannot deactivate location with active upcoming appointments");
        }

        return prisma.location.update({
            where: { id: locationId },
            data: { isActive: false }
        });
    }

    /**
     * Assign doctor to building location
     */
    async assignDoctorToLocation(organizationId: string, data: z.infer<typeof assignResourceSchema>) {
        const { doctorId, locationId } = assignResourceSchema.parse(data);

        const [doctor, location] = await Promise.all([
            prisma.doctor.findUnique({ where: { id: doctorId } }),
            prisma.location.findUnique({ where: { id: locationId } })
        ]);

        if (!doctor || doctor.organizationId !== organizationId) {
            throw new Error("Doctor not found in this organization");
        }

        if (!location || location.organizationId !== organizationId || !location.isActive) {
            throw new Error("Invalid location");
        }

        return prisma.doctor.update({
            where: { id: doctorId },
            data: { locationId }
        });
    }

    /**
     * Get organization metrics
     */
    async getMetrics(organizationId: string) {
        return getOrganizationMetrics(organizationId);
    }
}

export const organizationService = new OrganizationService();
