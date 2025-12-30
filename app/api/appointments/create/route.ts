import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, requireRole } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    requireRole(user, "PATIENT")
  } catch {
    return Response.json({ message: "Forbidden" }, { status: 403 });
  }

  const { doctorId, dateTime, reason } = await req.json();

  if (!doctorId || !dateTime) {
    return NextResponse.json(
      { message: "doctor and time are required" },
      { status: 400 }
    )
  }

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId }
  })

  if (!doctor || !doctor.available) {
    return NextResponse.json(
      { message: "Doctor not available" },
      { status: 400 }
    );
  }

  const appointment = await prisma.appointment.create({
    data: {
      dateTime: new Date(dateTime),
      reason,
      patientId: user.id,
      doctorId
    }
  })

  return NextResponse.json(
    { message: "Appointment created successfully", appointment },
    { status: 201 }
  )
}
