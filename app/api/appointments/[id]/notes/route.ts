import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const appointmentId = params.id;

    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            select: { patientId: true, doctor: { select: { userId: true } } }
        });

        if (!appointment) {
            return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
        }

        const isDoctor = appointment.doctor.userId === session.user.id;
        const isPatient = appointment.patientId === session.user.id;

        if (!isDoctor && !isPatient) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const notes = await prisma.consultationNote.findMany({
            where: { appointmentId },
            include: {
                doctor: {
                    include: { user: { select: { name: true } } }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ notes });
    } catch (error) {
        console.error("Error fetching notes:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const appointmentId = params.id;

    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { doctor: { select: { id: true, userId: true } } }
        });

        if (!appointment) {
            return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
        }

        if (appointment.doctor.userId !== session.user.id) {
            return NextResponse.json({ error: "Only the assigned doctor can send notes" }, { status: 403 });
        }

        if (appointment.status !== "COMPLETED") {
            return NextResponse.json({ error: "Notes can only be sent for completed appointments" }, { status: 400 });
        }

        const { title, content, category, isConfidential } = await req.json();

        if (!title?.trim() || !content?.trim()) {
            return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
        }

        const validCategories = ["DIAGNOSIS", "PRESCRIPTION", "FOLLOW_UP", "GENERAL"];
        const noteCategory = validCategories.includes(category) ? category : "GENERAL";

        const note = await prisma.consultationNote.create({
            data: {
                title: title.trim(),
                content: content.trim(),
                category: noteCategory,
                isConfidential: !!isConfidential,
                appointmentId,
                doctorId: appointment.doctor.id,
                patientId: appointment.patientId
            },
            include: {
                doctor: { include: { user: { select: { name: true } } } }
            }
        });

        return NextResponse.json({ note }, { status: 201 });
    } catch (error) {
        console.error("Error creating note:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
