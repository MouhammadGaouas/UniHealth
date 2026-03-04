import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { notificationService } from "@/lib/notifications";
import { enforceAppointmentLimit } from "@/lib/subscription-limits";

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const {
            doctorId,
            dateTime,
            appointmentTypeId,
            reason,
            notes
        } = await req.json();

        if (!doctorId || !dateTime) {
            return NextResponse.json({
                error: "doctorId and dateTime are required"
            }, { status: 400 });
        }

        const patientId = session.user.id;

        // Get doctor's organization to enforce limits
        const doctor = await prisma.doctor.findUnique({
            where: { id: doctorId },
            select: { organizationId: true }
        });

        if (!doctor?.organizationId) {
            return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
        }

        // Enforce appointment limit
        try {
            await enforceAppointmentLimit(doctor.organizationId);
        } catch (limitError: any) {
            return NextResponse.json({ error: limitError.message }, { status: 403 });
        }

        // Check for scheduling conflicts
        const existingAppointment = await prisma.appointment.findFirst({
            where: {
                doctorId,
                dateTime: new Date(dateTime),
                status: { in: ["PENDING", "CONFIRMED"] }
            }
        });

        if (existingAppointment) {
            return NextResponse.json({
                error: "Time slot is already booked"
            }, { status: 409 });
        }

        // Create the appointment
        const appointment = await prisma.appointment.create({
            data: {
                doctorId,
                patientId,
                dateTime: new Date(dateTime),
                appointmentTypeId: appointmentTypeId || null,
                reason: reason || null,
                notes: notes || null,
                status: "PENDING"
            },
            include: {
                patient: {
                    select: {
                        name: true,
                        email: true,
                        phoneNumber: true
                    }
                },
                doctor: {
                    include: {
                        user: { select: { name: true } }
                    }
                },
                location: { select: { name: true } },
                appointmentType: { select: { name: true, duration: true } }
            }
        });

        // Calculate end time if appointment type has duration
        if (appointment.appointmentType?.duration) {
            const endTime = new Date(appointment.dateTime.getTime() +
                appointment.appointmentType.duration * 60000);
            await prisma.appointment.update({
                where: { id: appointment.id },
                data: { endTime }
            });
        }

        // Send confirmation notification
        try {
            await notificationService.sendAppointmentConfirmation({
                appointmentId: appointment.id,
                patientName: appointment.patient.name || "",
                patientEmail: appointment.patient.email,
                patientPhone: appointment.patient.phoneNumber || undefined,
                doctorName: appointment.doctor.user.name || "Doctor",
                dateTime: appointment.dateTime,
                locationName: appointment.location?.name,
                appointmentType: appointment.appointmentType?.name
            });
        } catch (notifError) {
            console.error("Failed to send confirmation:", notifError);
            // Don't fail the request if notification fails
        }

        return NextResponse.json({ appointment }, { status: 201 });
    } catch (error) {
        console.error("Error creating appointment:", error);
        return NextResponse.json({
            error: "Internal server error"
        }, { status: 500 });
    }
}
