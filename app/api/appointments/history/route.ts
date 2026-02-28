import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = session.user;

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status'); // COMPLETED, CANCELLED, or null for all

    try {
        const now = new Date();

        const appointments = await prisma.appointment.findMany({
            where: {
                patientId: user.id,
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
                doctor: {
                    include: {
                        user: {
                            select: { name: true }
                        }
                    }
                },
                appointmentType: {
                    select: { name: true, duration: true }
                }
            },
            orderBy: {
                dateTime: 'desc'
            }
        });

        return NextResponse.json({ appointments }, { status: 200 });
    } catch (error) {
        console.error("Error fetching appointment history:", error);
        return NextResponse.json({ message: "Error fetching appointment history" }, { status: 500 });
    }
}
