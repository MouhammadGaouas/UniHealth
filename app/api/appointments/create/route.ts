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

    const { doctorId, dateTime, reason } = await req.json();

    if (!doctorId || !dateTime) {
      return NextResponse.json(
        { message: "doctor and time are required" },
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

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId }
    });



    if (!doctor || !doctor.available) {
      return NextResponse.json(
        { message: "Doctor not available" },
        { status: 400 }
      );
    }

    NextResponse.json(
      { message: "Doctor found and available" },
      { status: 200 }
    )

    const appointment = await prisma.appointment.create({
      data: {
        dateTime: appointmentDate,
        reason,
        patientId: user.id,
        doctorId
      }
    });

    return NextResponse.json(
      { message: "Appointment created successfully", appointment },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
