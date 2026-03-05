import { prisma } from '@/lib/prisma';
import {
    updateDoctorSettingsSchema,
    addDoctorLocationSchema,
    getDoctorAvailabilityQuerySchema
} from '@/lib/schemas';
import { z } from 'zod';
import { addMinutes, isBefore, isAfter, startOfDay, endOfDay, parseISO } from 'date-fns';

export class DoctorService {
    /**
     * Fetches settings for a specific doctor
     */
    async getSettings(userId: string) {
        const doctor = await prisma.doctor.findUnique({
            where: { userId },
            include: {
                location: {
                    select: { id: true, name: true, address: true, organization: { select: { name: true, type: true } } }
                },
                appointmentTypes: {
                    select: { id: true, name: true, duration: true, price: true }
                },
                organization: {
                    select: { id: true, name: true, type: true }
                }
            }
        });

        if (!doctor) throw new Error("Doctor profile not found");

        return {
            specialty: doctor.specialty,
            bio: doctor.bio,
            available: doctor.available,
            startTime: doctor.startTime,
            endTime: doctor.endTime,
            location: doctor.location,
            organization: doctor.organization,
            appointmentTypes: doctor.appointmentTypes
        };
    }

    /**
     * Updates settings for a specific doctor
     */
    async updateSettings(userId: string, data: z.infer<typeof updateDoctorSettingsSchema>) {
        const validData = updateDoctorSettingsSchema.parse(data);

        // Validate location if provided
        if (validData.locationId) {
            const location = await prisma.location.findUnique({
                where: { id: validData.locationId },
                select: { isActive: true }
            });
            if (!location || !location.isActive) {
                throw new Error("Location not found or inactive");
            }
        }

        const doctor = await prisma.doctor.update({
            where: { userId },
            data: validData
        });

        return {
            specialty: doctor.specialty,
            bio: doctor.bio,
            available: doctor.available,
            startTime: doctor.startTime,
            endTime: doctor.endTime,
            locationId: doctor.locationId
        };
    }

    /**
     * Gets all available doctors globally
     */
    async getAllDoctors() {
        return prisma.doctor.findMany({
            where: { available: true },
            include: {
                user: { select: { name: true, email: true } },
                organization: { select: { name: true } },
                location: { select: { name: true, address: true } }
            }
        });
    }

    /**
     * Gets a single doctor's setup to compute availability
     */
    async getAvailability(params: z.infer<typeof getDoctorAvailabilityQuerySchema>) {
        const { doctorId, date } = getDoctorAvailabilityQuerySchema.parse(params);

        const doctor = await prisma.doctor.findUnique({
            where: { id: doctorId },
            select: { startTime: true, endTime: true, available: true }
        });

        if (!doctor) throw new Error("Doctor not found");

        // Fetch appointments for this specific date
        // Note: We parse the local date string "YYYY-MM-DD" and find overlap
        const queryDateStart = parseISO(`${date}T00:00:00.000Z`);
        const queryDateEnd = parseISO(`${date}T23:59:59.999Z`);

        const appointments = await prisma.appointment.findMany({
            where: {
                doctorId,
                status: { in: ['PENDING', 'CONFIRMED'] },
                dateTime: { gte: queryDateStart, lte: queryDateEnd }
            },
            select: { dateTime: true, endTime: true }
        });

        const bookedSlots = appointments.map(apt => ({
            start: apt.dateTime.toISOString(),
            end: apt.endTime ? apt.endTime.toISOString() : addMinutes(apt.dateTime, 30).toISOString()
        }));

        return {
            available: doctor.available,
            workingHours: {
                start: doctor.startTime,
                end: doctor.endTime
            },
            bookedSlots
        };
    }

    /**
     * Gets appointment types for a specific doctor
     */
    async getAppointmentTypes(doctorId: string) {
        const doctor = await prisma.doctor.findUnique({
            where: { id: doctorId },
            select: { id: true }
        });

        if (!doctor) throw new Error("Doctor not found");

        return prisma.appointmentType.findMany({
            where: { doctorId }
        });
    }
}

export const doctorService = new DoctorService();
