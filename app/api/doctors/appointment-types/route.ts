import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');

    if (!doctorId) {
        return NextResponse.json({ message: "Missing doctorId" }, { status: 400 });
    }

    try {
        const appointmentTypes = await prisma.appointmentType.findMany({
            where: { doctorId },
            orderBy: { duration: 'asc' }
        });

        return NextResponse.json({ appointmentTypes }, { status: 200 });
    } catch (error) {
        console.error("Error fetching appointment types:", error);
        return NextResponse.json({ message: "Error fetching appointment types" }, { status: 500 });
    }
}
