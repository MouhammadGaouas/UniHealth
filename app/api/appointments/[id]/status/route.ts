import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

const ALLOWED_STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] as const;
type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const appointmentId = params.id;
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const user = session.user;
  const userRole = (user as Record<string, unknown>).role as string;

  if (!appointmentId) {
    return NextResponse.json(
      { message: 'Invalid appointment id in URL' },
      { status: 400 }
    );
  }

  try {
    const { status } = (await req.json()) as { status?: string };

    if (!status || !ALLOWED_STATUSES.includes(status as AllowedStatus)) {
      return NextResponse.json(
        { message: 'Invalid or missing status' },
        { status: 400 }
      );
    }

    // Fetch the appointment to verify ownership
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: {
          select: { userId: true }
        }
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { message: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Authorization logic based on user role
    if (userRole === 'DOCTOR') {
      if (appointment.doctor.userId !== user.id) {
        return NextResponse.json(
          { message: 'Appointment not found for this doctor' },
          { status: 404 }
        );
      }
    } else if (userRole === 'PATIENT') {
      if (appointment.patientId !== user.id) {
        return NextResponse.json(
          { message: 'Appointment not found' },
          { status: 404 }
        );
      }
      if (status !== 'CANCELLED') {
        return NextResponse.json(
          { message: 'Patients can only cancel appointments' },
          { status: 403 }
        );
      }
      if (appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED') {
        return NextResponse.json(
          { message: `Cannot cancel an appointment that is already ${appointment.status.toLowerCase()}` },
          { status: 400 }
        );
      }
    } else if (userRole === 'ADMIN') {
      // Admins can update any appointment status
    } else {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: status as AllowedStatus },
      include: {
        patient: {
          select: { name: true, email: true },
        },
        doctor: {
          include: {
            user: {
              select: { name: true }
            }
          }
        }
      },
    });

    return NextResponse.json(
      { message: 'Status updated successfully', appointment: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating appointment status:', error);
    return NextResponse.json(
      { message: 'Error updating appointment status' },
      { status: 500 }
    );
  }
}
