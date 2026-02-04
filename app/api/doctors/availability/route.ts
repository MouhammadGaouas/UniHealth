import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const dateParam = searchParams.get('date');

    if (!doctorId || !dateParam) {
        return NextResponse.json({ message: "Missing doctorId or date" }, { status: 400 });
    }

    try {
        const date = parseISO(dateParam);
        const start = startOfDay(date);
        const end = endOfDay(date);

        // Fetch doctor's working hours
        const doctor = await prisma.doctor.findUnique({
            where: { id: doctorId },
            select: { startTime: true, endTime: true }
        });

        if (!doctor) {
            return NextResponse.json({ message: "Doctor not found" }, { status: 404 });
        }

        const appointments = await prisma.appointment.findMany({
            where: {
                doctorId: doctorId,
                status: {
                    not: 'CANCELLED'
                },
                dateTime: {
                    gte: start,
                    lte: end
                }
            },
            select: {
                dateTime: true,
                endTime: true,
            }
        });

        // If endTime is missing (legacy data), assume 30 mins
        const bookedSlots = appointments.map(appt => ({
            start: appt.dateTime.toISOString(),
            end: (appt.endTime || new Date(appt.dateTime.getTime() + 30 * 60000)).toISOString()
        }));

        return NextResponse.json({
            bookedSlots,
            workDayStart: doctor?.startTime || "09:00",
            workDayEnd: doctor?.endTime || "17:00"
        }, { status: 200 });
    } catch (error) {
        console.error("Error fetching availability:", error);
        return NextResponse.json({ message: "Error fetching availability" }, { status: 500 });
    }
}
