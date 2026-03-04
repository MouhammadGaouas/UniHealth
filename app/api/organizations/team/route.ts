import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { organizationId: true, role: true }
        });

        if (!user?.organizationId) {
            return NextResponse.json({ error: "No organization found" }, { status: 404 });
        }

        if (user.role !== "ORG_ADMIN" && user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const doctors = await prisma.doctor.findMany({
            where: { organizationId: user.organizationId },
            include: {
                user: { select: { id: true, name: true, email: true } },
                location: { select: { id: true, name: true } }
            },
            orderBy: { user: { name: "asc" } }
        });

        return NextResponse.json({ doctors });
    } catch (error) {
        console.error("Error fetching team:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { organizationId: true, role: true }
        });

        if (!user?.organizationId || (user.role !== "ORG_ADMIN" && user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { doctorId } = await req.json();
        if (!doctorId) {
            return NextResponse.json({ error: "doctorId is required" }, { status: 400 });
        }

        const doctor = await prisma.doctor.findUnique({
            where: { id: doctorId },
            select: { organizationId: true, userId: true }
        });

        if (!doctor || doctor.organizationId !== user.organizationId) {
            return NextResponse.json({ error: "Doctor not found in your organization" }, { status: 404 });
        }

        await prisma.doctor.update({
            where: { id: doctorId },
            data: { organizationId: null, locationId: null }
        });

        return NextResponse.json({ message: "Doctor removed from organization" });
    } catch (error) {
        console.error("Error removing team member:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
