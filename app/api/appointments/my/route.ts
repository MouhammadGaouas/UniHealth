import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const user = getAuthUser(req);

    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (user.role === "PATIENT") {
        const appointments = await prisma.appointment.findMany({
            where: { patientId: user.id },
            include: {
                doctor: {
                    include: {
                        user: {
                            select: { name: true, email: true }
                        }
                    }
                }
            },
            orderBy: {
                dateTime: "asc"
            }
        });


        return NextResponse.json(appointments)

        
    } else if (user.role === "DOCTOR") {
        // First, get the doctor profile for this user
        const doctor = await prisma.doctor.findUnique({
            where: { userId: user.id }
        });

        if (!doctor) {
            return NextResponse.json(
                { message: 'Doctor profile not found' },
                { status: 404 }
            );
        }

        const appointments = await prisma.appointment.findMany({
            where: { doctorId: doctor.id },
            include: {
                patient: {
                    select: { name: true, email: true }
                }
            },
            orderBy: {
                dateTime: "asc"
            }
        });
        return NextResponse.json(appointments)
    }

    return NextResponse.json(
        { message: 'Invalid role' },
        { status: 400 }
    );
}