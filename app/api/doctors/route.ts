import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const doctors = await prisma.doctor.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    }
                }
            }
        });
        return NextResponse.json({ doctors }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error fetching doctors" }, { status: 500 });
    }
}
