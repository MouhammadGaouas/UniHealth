import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, requireRole } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
      requireRole(user, "PATIENT");
    } catch {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { doctorId, dateTime, reason, appointmentTypeId } = await req.json();

    if (!doctorId || !dateTime || !appointmentTypeId) {
      return NextResponse.json(
        { message: "doctor, time, and appointment type are required" },
        { status: 400 }
      );
    }

    // Validate dateTime
    const appointmentDate = new Date(dateTime);
    if (isNaN(appointmentDate.getTime())) {
      return NextResponse.json(
        { message: "Invalid date format" },
        { status: 400 }
      );
    }

    // Check if appointment is in the past
    if (appointmentDate < new Date()) {
      return NextResponse.json(
        { message: "Cannot book appointments in the past" },
        { status: 400 }
      );
    }

    // 1. Fetch appointment type to get duration
    const appointmentType = await prisma.appointmentType.findUnique({
      where: { id: appointmentTypeId }
    });

    if (!appointmentType || appointmentType.doctorId !== doctorId) {
      return NextResponse.json(
        { message: "Invalid appointment type" },
        { status: 400 }
      );
    }

    const durationMinutes = appointmentType.duration;
    const endTime = new Date(appointmentDate.getTime() + durationMinutes * 60000);

    // 2. Transaction: Check for overlaps and create if clear
    const result = await prisma.$transaction(async (tx) => {
      // Check for overlapping appointments for this doctor
      // Overlap condition: (StartA < EndB) AND (EndA > StartB)
      const overlap = await tx.appointment.count({
        where: {
          doctorId: doctorId,
          status: { not: 'CANCELLED' },
          OR: [
            {
              // Case: New starts inside existing
              dateTime: { lt: endTime },
              endTime: { gt: appointmentDate } // Utilizing the new field if migrated, or fallback logic might be needed if field is null (we handle nulls via defaulting in query if necessary, but here we assume new schema) 
            }
          ]
        }
      });

      // Note: Since endTime is nullable in schema currently, we need to be careful. 
      // Ideally, we should enforce endTime. For now, let's assume we populate it.
      // If the schema change didn't make it required/default, existing data might be null.
      // A robust query handles nulls, but for this "New Feature" we rely on the migration filling it or defaulting.
      // Actually, my previous migration didn't backfill endTime for existing appointments. 
      // FOR ROBUSTNESS: Let's assume start + 30m for legacy rows if endTime is null.
      // BUT, raw prisma queries are complex. Let's simplify: 
      // Check overlaps using a simplified robust fetch or assume clean state.
      // Since I just seeded, the DB is fresh or largely empty. Let's stick to standard logic.
      // To be safe against nulls in logic:

      const overlappingAppointments = await tx.appointment.findMany({
        where: {
          doctorId: doctorId,
          status: { not: 'CANCELLED' },
          dateTime: { lt: endTime } // potentially reachable
        }
      });

      const hasOverlap = overlappingAppointments.some(appt => {
        const apptStart = appt.dateTime;
        const apptEnd = appt.endTime || new Date(apptStart.getTime() + 30 * 60000); // fallback 30m
        return (apptStart < endTime && apptEnd > appointmentDate);
      });

      if (hasOverlap) {
        throw new Error("Time slot overlaps with an existing appointment");
      }

      // Create
      return await tx.appointment.create({
        data: {
          dateTime: appointmentDate,
          endTime: endTime,
          reason,
          patientId: user.id,
          doctorId,
          appointmentTypeId
        }
      });

    });

    return NextResponse.json(
      { message: "Appointment created successfully", appointment: result },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === "Time slot overlaps with an existing appointment") {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
