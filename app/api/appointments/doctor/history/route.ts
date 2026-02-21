import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const user = getAuthUser(req);

    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        try {
            requireRole(user, 'DOCTOR');
        } catch {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const doctor = await prisma.doctor.findUnique({
            where: { userId: user.id },
        });

        if (!doctor) {
            return NextResponse.json(
                { message: 'Doctor profile not found' },
                { status: 404 }
            );
        }

        const { searchParams } = new URL(req.url);
        const statusFilter = searchParams.get('status');

        const now = new Date();

        const appointments = await prisma.appointment.findMany({
            where: {
                doctorId: doctor.id,
                OR: [
                    { status: 'COMPLETED' },
                    { status: 'CANCELLED' },
                    { dateTime: { lt: now } },
                ],
                ...(statusFilter && ['COMPLETED', 'CANCELLED'].includes(statusFilter)
                    ? { status: statusFilter as 'COMPLETED' | 'CANCELLED' }
                    : {}),
            },
            include: {
                patient: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                appointmentType: {
                    select: { name: true, duration: true }
                }
            },
            orderBy: {
                dateTime: 'desc',
            },
        });

        return NextResponse.json({ appointments }, { status: 200 });
    } catch (error) {
        console.error('Error fetching doctor appointment history:', error);
        return NextResponse.json(
            { message: 'Error fetching appointment history' },
            { status: 500 }
        );
    }
}
