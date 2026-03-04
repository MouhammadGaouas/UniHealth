import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const notes = await prisma.consultationNote.findMany({
            where: { patientId: session.user.id },
            include: {
                doctor: {
                    include: { user: { select: { name: true } } }
                },
                appointment: {
                    select: { dateTime: true, status: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ notes });
    } catch (error) {
        console.error("Error fetching consultations:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
