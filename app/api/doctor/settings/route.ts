import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session || (session.user as Record<string, unknown>).role !== 'DOCTOR') {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = session.user;

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
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session || (session.user as Record<string, unknown>).role !== 'DOCTOR') {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = session.user;

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
