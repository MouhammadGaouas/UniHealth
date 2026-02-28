import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if ((session.user as Record<string, unknown>).role !== 'ADMIN') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        // Get counts for dashboard stats
        const [
            totalUsers,
            totalDoctors,
            totalPatients,
            totalAppointments,
            pendingAppointments,
            confirmedAppointments,
            completedAppointments,
            cancelledAppointments
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { role: 'DOCTOR' } }),
            prisma.user.count({ where: { role: 'PATIENT' } }),
            prisma.appointment.count(),
            prisma.appointment.count({ where: { status: 'PENDING' } }),
            prisma.appointment.count({ where: { status: 'CONFIRMED' } }),
            prisma.appointment.count({ where: { status: 'COMPLETED' } }),
            prisma.appointment.count({ where: { status: 'CANCELLED' } }),
        ]);

        return NextResponse.json({
            users: {
                total: totalUsers,
                doctors: totalDoctors,
                patients: totalPatients,
            },
            appointments: {
                total: totalAppointments,
                pending: pendingAppointments,
                confirmed: confirmedAppointments,
                completed: completedAppointments,
                cancelled: cancelledAppointments,
            }
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json(
            { message: 'Error fetching stats' },
            { status: 500 }
        );
    }
}
