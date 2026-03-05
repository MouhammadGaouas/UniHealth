import { prisma } from '@/lib/prisma';
import { adminMakeDoctorSchema, adminUsersQuerySchema, adminOrganizationsQuerySchema, adminUserActionSchema } from '@/lib/schemas';
import { z } from 'zod';
import { getPlatformMetrics } from '@/lib/analytics';

export class AdminService {
    /**
     * Promotes a regular user to a DOCTOR role and creates their profile
     */
    async promoteUserToDoctor(data: z.infer<typeof adminMakeDoctorSchema>) {
        const { userId, specialty } = adminMakeDoctorSchema.parse(data);

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error("User not found");
        if (user.role === "DOCTOR") throw new Error("User is already a doctor");

        const [, doctor] = await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { role: "DOCTOR" },
            }),
            prisma.doctor.create({
                data: {
                    userId,
                    specialty,
                    organizationId: user.organizationId,
                    appointmentTypes: {
                        create: [
                            { name: "General Consultation", duration: 30, price: 50 },
                            { name: "Follow-up", duration: 15, price: 30 },
                        ],
                    },
                },
                include: { user: true },
            }),
        ]);

        return doctor;
    }

    /**
     * Fetches users with optional filters (role, search)
     */
    async getUsers(params: z.infer<typeof adminUsersQuerySchema>) {
        const { role, search } = adminUsersQuerySchema.parse(params);

        return prisma.user.findMany({
            where: {
                AND: [
                    role ? { role } : {},
                    search ? {
                        OR: [
                            { name: { contains: search, mode: 'insensitive' } },
                            { email: { contains: search, mode: 'insensitive' } }
                        ]
                    } : {}
                ]
            },
            select: {
                id: true, name: true, email: true, role: true, createdAt: true,
                emailVerified: true, phoneNumber: true, organizationId: true,
                banned: true, banReason: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Fetches organizations with optional filters (type, search)
     */
    async getOrganizations(params: z.infer<typeof adminOrganizationsQuerySchema>) {
        const { type, search } = adminOrganizationsQuerySchema.parse(params);

        return prisma.organization.findMany({
            where: {
                AND: [
                    type ? { type } : {},
                    search ? { name: { contains: search, mode: "insensitive" } } : {}
                ]
            },
            include: {
                _count: { select: { doctors: true, locations: true } },
                subscription: {
                    select: { planTier: true, status: true, updatedAt: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });
    }

    /**
     * Bans or unbans a user account
     */
    async setUserBanStatus(userId: string, data: z.infer<typeof adminUserActionSchema>) {
        const { action, reason } = adminUserActionSchema.parse(data);

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error("User not found");
        if (user.role === "ADMIN") throw new Error("Cannot ban a fellow system administrator");

        const isBanned = action === 'ban';

        return prisma.user.update({
            where: { id: userId },
            data: {
                banned: isBanned,
                banReason: isBanned ? reason : null,
            }
        });
    }

    /**
     * Fetches platform statistics
     */
    async getPlatformStats() {
        return getPlatformMetrics();
    }
}

export const adminService = new AdminService();
