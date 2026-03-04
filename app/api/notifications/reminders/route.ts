import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notificationService } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

/**
 * Send reminders for upcoming appointments
 * Called by cron job or manually by admins
 */
export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { hoursBefore = 24 } = await req.json().catch(() => ({}));

        const result = await notificationService.sendBulkReminders(hoursBefore);

        return NextResponse.json({
            message: "Reminders sent",
            sent: result.sent,
            failed: result.failed
        });
    } catch (error) {
        console.error("Error sending reminders:", error);
        return NextResponse.json({ 
            error: "Internal server error" 
        }, { status: 500 });
    }
}

/**
 * Get reminder statistics
 */
export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const upcomingAppointments = await prisma.appointment.count({
            where: {
                dateTime: {
                    gte: now,
                    lt: tomorrow
                },
                status: "CONFIRMED"
            }
        });

        return NextResponse.json({
            upcomingIn24Hours: upcomingAppointments
        });
    } catch (error) {
        console.error("Error fetching reminder stats:", error);
        return NextResponse.json({ 
            error: "Internal server error" 
        }, { status: 500 });
    }
}
