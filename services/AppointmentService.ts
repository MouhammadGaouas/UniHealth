import { prisma } from '@/lib/prisma';
import {
    createAppointmentSchema,
    appointmentHistoryQuerySchema,
    updateAppointmentStatusSchema,
    createConsultationNoteSchema
} from '@/lib/schemas';
import { z } from 'zod';
import { notificationService } from '@/lib/notifications';
import { enforceAppointmentLimit } from '@/lib/subscription-limits';
import { parseISO, isBefore, addMinutes } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export class AppointmentService {
    /**
     * The default timezone for the platform if none is specified. 
     * In a real global application, this would come from the user's or org's settings.
     */
    private readonly defaultTimezone = 'Africa/Algiers';

    /**
     * Create a new appointment
     */
    async createAppointment(patientId: string, data: z.infer<typeof createAppointmentSchema>) {
        const validData = createAppointmentSchema.parse(data);

        // Explicit Timezone Handling: Parse the incoming ISO string explicitly to UTC
        const appointmentDateTimeUtc = parseISO(validData.dateTime);

        // Ensure the parsed UTC time is actually in the future
        if (isBefore(appointmentDateTimeUtc, new Date())) {
            throw new Error("Appointment must be in the future");
        }

        // Get doctor info (including org for limits + available boolean)
        const doctor = await prisma.doctor.findUnique({
            where: { id: validData.doctorId },
            select: { organizationId: true, available: true }
        });

        if (!doctor?.organizationId) {
            throw new Error("Doctor not found");
        }

        if (!doctor.available) {
            throw new Error("Doctor is not currently available");
        }

        // Enforce limits
        await enforceAppointmentLimit(doctor.organizationId);

        // Determine duration
        let duration = 30; // Default 30 min
        if (validData.appointmentTypeId) {
            const aptType = await prisma.appointmentType.findUnique({
                where: { id: validData.appointmentTypeId },
                select: { duration: true, doctorId: true }
            });
            if (aptType) {
                if (aptType.doctorId !== validData.doctorId) {
                    throw new Error("Appointment type does not belong to this doctor");
                }
                duration = aptType.duration;
            }
        }

        const newStartUtc = appointmentDateTimeUtc;
        const newEndUtc = addMinutes(newStartUtc, duration);

        // Conflict detection using robust time-range overlap overlap
        const conflict = await prisma.appointment.findFirst({
            where: {
                doctorId: validData.doctorId,
                status: { in: ["PENDING", "CONFIRMED"] },
                dateTime: { lt: newEndUtc },
                endTime: { gt: newStartUtc }
            }
        });

        if (conflict) {
            throw new Error("Time slot conflicts with an existing appointment");
        }

        // Create the appointment
        const appointment = await prisma.appointment.create({
            data: {
                doctorId: validData.doctorId,
                patientId,
                dateTime: newStartUtc,
                endTime: newEndUtc,
                appointmentTypeId: validData.appointmentTypeId || null,
                reason: validData.reason || null,
                notes: validData.notes || null,
                status: "PENDING"
            },
            include: {
                patient: { select: { name: true, email: true, phoneNumber: true } },
                doctor: { include: { user: { select: { name: true } } } },
                location: { select: { name: true } },
                appointmentType: { select: { name: true, duration: true } }
            }
        });

        // Send async confirmation notification without failing the main request
        // Localize the time for the notification context
        const localizedTime = toZonedTime(appointment.dateTime, this.defaultTimezone);

        notificationService.sendAppointmentConfirmation({
            appointmentId: appointment.id,
            patientName: appointment.patient.name || "",
            patientEmail: appointment.patient.email,
            patientPhone: appointment.patient.phoneNumber || undefined,
            doctorName: appointment.doctor.user.name || "Doctor",
            dateTime: localizedTime,
            locationName: appointment.location?.name,
            appointmentType: appointment.appointmentType?.name
        }).catch(err => console.error("Failed to send confirmation:", err));

        return appointment;
    }

    /**
     * Get appointments for the logged-in patient
     */
    async getMyUpcomingAppointments(patientId: string) {
        const now = new Date();
        return prisma.appointment.findMany({
            where: {
                patientId,
                status: { in: ['PENDING', 'CONFIRMED'] },
                dateTime: { gte: now } // Only future appointments logic moved to backend layer
            },
            include: {
                doctor: { include: { user: { select: { name: true } } } },
                location: { select: { name: true, address: true } },
                appointmentType: { select: { name: true, duration: true, price: true } }
            },
            orderBy: { dateTime: 'asc' }
        });
    }

    /**
     * Get upcoming appointments for a specific doctor
     */
    async getDoctorUpcomingAppointments(doctorId: string) {
        const now = new Date();
        return prisma.appointment.findMany({
            where: {
                doctorId,
                status: { in: ['PENDING', 'CONFIRMED'] },
                dateTime: { gte: now }
            },
            include: {
                patient: { select: { name: true, email: true, phoneNumber: true } },
                location: { select: { name: true } },
                appointmentType: { select: { name: true, duration: true } }
            },
            orderBy: { dateTime: 'asc' }
        });
    }

    /**
     * Get appointment history with strict role filtering
     */
    async getHistory(userId: string, role: string, queryParams: Record<string, any>) {
        const { status } = appointmentHistoryQuerySchema.parse(queryParams);
        const now = new Date();

        let baseWhere: any = {};

        if (role === 'DOCTOR') {
            const doctor = await prisma.doctor.findUnique({ where: { userId }, select: { id: true } });
            if (!doctor) throw new Error("Doctor profile not found");
            baseWhere.doctorId = doctor.id;
        } else {
            baseWhere.patientId = userId;
        }

        if (status) {
            baseWhere.status = status;
        } else {
            baseWhere.OR = [
                { status: 'COMPLETED' },
                { status: 'CANCELLED' },
                { dateTime: { lt: now } }
            ];
        }

        return prisma.appointment.findMany({
            where: baseWhere,
            include: {
                ...(role === 'DOCTOR'
                    ? { patient: { select: { name: true, email: true, phoneNumber: true } } }
                    : { doctor: { include: { user: { select: { name: true } } } } }
                ),
                appointmentType: { select: { name: true, duration: true } }
            },
            orderBy: { dateTime: 'desc' }
        });
    }

    /**
     * Update appointment status with strict authorization checks
     */
    async updateStatus(
        userId: string,
        role: string,
        appointmentId: string,
        data: z.infer<typeof updateAppointmentStatusSchema>
    ) {
        const { status, reason } = updateAppointmentStatusSchema.parse(data);

        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { doctor: { select: { userId: true, organizationId: true } } }
        });

        if (!appointment) throw new Error("Appointment not found");

        // Strict Authorization
        if (role === 'DOCTOR' && appointment.doctor.userId !== userId) {
            throw new Error("Forbidden: Appointment not found for this doctor");
        }

        if (role === 'PATIENT') {
            if (appointment.patientId !== userId) {
                throw new Error("Forbidden: Appointment not found");
            }
            if (status !== 'CANCELLED') {
                throw new Error("Forbidden: Patients can only cancel appointments");
            }
            if (appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED') {
                throw new Error(`Cannot cancel an appointment that is already ${appointment.status.toLowerCase()}`);
            }
        }

        if (role === 'ORG_ADMIN') {
            const orgAdmin = await prisma.user.findUnique({ where: { id: userId }, select: { organizationId: true } });
            if (!orgAdmin?.organizationId || orgAdmin.organizationId !== appointment.doctor.organizationId) {
                throw new Error("Forbidden: Cannot manage appointments outside your organization");
            }
        }

        const updated = await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status }
        });

        // Note operations logic merged here if status changed to cancelled with a reason
        if (status === 'CANCELLED' && reason) {
            await notificationService.sendAppointmentCancellation({
                appointmentId: updated.id,
                patientName: "", // Fetchable if needed for email template
                patientEmail: "placeholder@see.logs",
                doctorName: "Doctor",
                dateTime: updated.dateTime,
            }, reason).catch(console.error);
        }

        return updated;
    }

    /**
     * Manage consultation notes linked to an appointment
     */
    async getNotes(appointmentId: string, userId: string, role: string) {
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { doctor: true }
        });

        if (!appointment) throw new Error("Appointment not found");

        if (role === 'DOCTOR' && appointment.doctor.userId !== userId) throw new Error("Forbidden");
        if (role === 'PATIENT' && appointment.patientId !== userId) throw new Error("Forbidden");

        return prisma.consultationNote.findMany({
            where: { appointmentId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async createNote(appointmentId: string, doctorUserId: string, data: z.infer<typeof createConsultationNoteSchema>) {
        const { title, content, category } = createConsultationNoteSchema.parse(data);

        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { doctor: true }
        });

        if (!appointment) throw new Error("Appointment not found");
        if (appointment.doctor.userId !== doctorUserId) throw new Error("Forbidden: Only the assigned doctor can add notes");
        if (appointment.status !== 'COMPLETED') throw new Error("Can only add notes to completed appointments");

        return prisma.consultationNote.create({
            data: {
                appointmentId,
                doctorId: appointment.doctorId,
                patientId: appointment.patientId,
                title,
                content,
                category
            }
        });
    }
}

export const appointmentService = new AppointmentService();
