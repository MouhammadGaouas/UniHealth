import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = session.user;

    if ((user as Record<string, unknown>).role !== "PATIENT") {
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

    // 2. Verify doctor exists and is available
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { available: true, startTime: true, endTime: true }
    });

    if (!doctor) {
      return NextResponse.json(
        { message: "Doctor not found" },
        { status: 404 }
      );
    }

    if (!doctor.available) {
      return NextResponse.json(
        { message: "Doctor is currently not accepting appointments" },
        { status: 400 }
      );
    }

    // 3. Validate appointment time is within doctor's working hours
    const appointmentHour = appointmentDate.getHours();
    const appointmentMinute = appointmentDate.getMinutes();

    const [startH, startM] = doctor.startTime.split(':').map(Number);
    const [endH, endM] = doctor.endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const apptMinutes = appointmentHour * 60 + appointmentMinute;
    const durationMinutes = appointmentType.duration;
    const apptEndMinutes = apptMinutes + durationMinutes;

    if (apptMinutes < startMinutes || apptEndMinutes > endMinutes) {
      return NextResponse.json(
        { message: `Appointment must be within doctor's working hours (${doctor.startTime} - ${doctor.endTime})` },
        { status: 400 }
      );
    }

    const endTime = new Date(appointmentDate.getTime() + durationMinutes * 60000);

    // 4. Transaction: Check for overlaps and create if clear
    const result = await prisma.$transaction(async (tx) => {
      // Find appointments that overlap with the requested time window
      const overlappingAppointments = await tx.appointment.findFirst({
        where: {
          doctorId: doctorId,
          status: { not: 'CANCELLED' },
          // Overlap condition: (StartA < EndB) and (EndA > StartB)
          dateTime: { lt: endTime },
          OR: [
            { endTime: { gt: appointmentDate } },
            // Fallback for older records without endTime (assume 30 mins)
            {
              endTime: null,
              // Prisma doesn't support complex math in where clauses easily for dates, 
              // so we handle the null fallback slightly imperfectly here or force db migration.
              // Given the schema added endTime later, we do a basic check here or rely on the JS filter below.
            }
          ]
        }
      });

      // To be completely safe with mixed null endTimes, we fetch potentials and filter in JS
      const potentials = await tx.appointment.findMany({
        where: {
          doctorId: doctorId,
          status: { not: 'CANCELLED' },
          dateTime: { lt: endTime }
        }
      });

      const hasOverlap = potentials.some(appt => {
        const apptStart = appt.dateTime;
        const apptEnd = appt.endTime || new Date(apptStart.getTime() + 30 * 60000);
        return (apptStart < endTime && apptEnd > appointmentDate);
      });

      if (hasOverlap) {
        throw new Error("Time slot overlaps with an existing appointment");
      }

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
  } catch (error: Error | any) {
    if (error?.message === "Time slot overlaps with an existing appointment") {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

