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
            include: {
                location: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        organization: {
                            select: { name: true, type: true }
                        }
                    }
                },
                appointmentTypes: {
                    select: {
                        id: true,
                        name: true,
                        duration: true,
                        price: true
                    }
                },
                organization: {
                    select: {
                        id: true,
                        name: true,
                        type: true
                    }
                }
            }
        });

        if (!doctor) {
            return NextResponse.json({ message: "Doctor profile not found" }, { status: 404 });
        }

        return NextResponse.json({
            specialty: doctor.specialty,
            bio: doctor.bio,
            available: doctor.available,
            startTime: doctor.startTime,
            endTime: doctor.endTime,
            location: doctor.location,
            organization: doctor.organization,
            appointmentTypes: doctor.appointmentTypes
        });
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
        const { startTime, endTime, specialty, bio, available, locationId } = await req.json();

        const updateData: Record<string, any> = {};
        if (startTime) updateData.startTime = startTime;
        if (endTime) updateData.endTime = endTime;
        if (specialty) updateData.specialty = specialty;
        if (bio !== undefined) updateData.bio = bio;
        if (available !== undefined) updateData.available = available;
        if (locationId !== undefined) updateData.locationId = locationId;

        // Basic validation
        if (startTime && endTime && startTime >= endTime) {
            return NextResponse.json({ 
                message: "End time must be after start time" 
            }, { status: 400 });
        }

        const doctor = await prisma.doctor.update({
            where: { userId: user.id },
            data: updateData
        });

        return NextResponse.json({
            specialty: doctor.specialty,
            bio: doctor.bio,
            available: doctor.available,
            startTime: doctor.startTime,
            endTime: doctor.endTime,
            locationId: doctor.locationId
        });
    } catch (error) {
        console.error("Error updating settings:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
