import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const doctors = await prisma.doctor.findMany({
            where: {
                available: true
            },
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
        console.error("Error fetching doctors:", error);
        return NextResponse.json({ message: "Error fetching doctors" }, { status: 500 });
    }
}
