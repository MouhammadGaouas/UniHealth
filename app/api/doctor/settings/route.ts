import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const user = getAuthUser(req);

    if (!user || user.role !== 'DOCTOR') {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const doctor = await prisma.doctor.findUnique({
            where: { userId: user.id },
            select: { startTime: true, endTime: true }
        });

        if (!doctor) {
            return NextResponse.json({ message: "Doctor profile not found" }, { status: 404 });
        }

        return NextResponse.json(doctor);
    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const user = getAuthUser(req);

    if (!user || user.role !== 'DOCTOR') {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { startTime, endTime } = await req.json();

        // Basic validation
        if (!startTime || !endTime) {
            return NextResponse.json({ message: "Start time and end time are required" }, { status: 400 });
        }

        const doctor = await prisma.doctor.update({
            where: { userId: user.id },
            data: { startTime, endTime }
        });

        return NextResponse.json(doctor);
    } catch (error) {
        console.error("Error updating settings:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
