import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const user = session.user;

  if ((user as Record<string, unknown>).role !== 'DOCTOR') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
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
        status: { in: ['PENDING', 'CONFIRMED'] },
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
