import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Ensure only doctors can access this endpoint
    try {
      requireRole(user, 'DOCTOR');
    } catch {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Find the doctor's profile linked to this user
    const doctor = await prisma.doctor.findUnique({
      where: { userId: user.id },
    });

    if (!doctor) {
      return NextResponse.json(
        { message: 'Doctor profile not found for this user' },
        { status: 404 }
      );
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
      },
      include: {
        patient: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        dateTime: 'asc',
      },
    });

    return NextResponse.json({ appointments }, { status: 200 });
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    return NextResponse.json(
      { message: 'Error fetching doctor appointments' },
      { status: 500 }
    );
  }
}

