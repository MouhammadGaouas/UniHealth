import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const user = getAuthUser(req);

    if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

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
        return NextResponse.json({ message: "Error fetching appointments" }, { status: 500 });
    }
}