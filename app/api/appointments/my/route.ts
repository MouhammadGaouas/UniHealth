import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = session.user;

    try {
        const appointments = await prisma.appointment.findMany({
            where: {
                patientId: user.id
            },
            include: {
                doctor: {
                    include: {
                        user: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: {
                dateTime: 'desc'
            }
        });

        return NextResponse.json({ appointments }, { status: 200 });
    } catch (error) {
        console.error("Error fetching appointments:", error);
        return NextResponse.json({ message: "Error fetching appointments" }, { status: 500 });
    }
}