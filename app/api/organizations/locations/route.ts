import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { enforceLocationLimit } from "@/lib/subscription-limits";

export async function GET() {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { organizationId: true }
        });

        if (!user?.organizationId) {
            return NextResponse.json({ error: "No organization found" }, { status: 404 });
        }

        const locations = await prisma.location.findMany({
            where: { organizationId: user.organizationId },
            include: {
                _count: { select: { doctors: true, appointments: true } }
            },
            orderBy: { name: "asc" }
        });

        return NextResponse.json({ locations });
    } catch (error) {
        console.error("Error fetching locations:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
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

        const { name, address, city, state, country, phone } = await req.json();

        if (!name || !address) {
            return NextResponse.json({ error: "Name and address are required" }, { status: 400 });
        }

        // Enforce subscription location limit
        try {
            await enforceLocationLimit(user.organizationId);
        } catch (limitError: any) {
            return NextResponse.json({ error: limitError.message }, { status: 403 });
        }

        const location = await prisma.location.create({
            data: {
                name,
                address,
                city: city || null,
                state: state || null,
                country: country || null,
                phone: phone || null,
                organizationId: user.organizationId
            }
        });

        return NextResponse.json({ location }, { status: 201 });
    } catch (error) {
        console.error("Error creating location:", error);
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

        const { locationId } = await req.json();
        if (!locationId) {
            return NextResponse.json({ error: "locationId is required" }, { status: 400 });
        }

        const location = await prisma.location.findUnique({
            where: { id: locationId },
            select: { organizationId: true }
        });

        if (!location || location.organizationId !== user.organizationId) {
            return NextResponse.json({ error: "Location not found in your organization" }, { status: 404 });
        }

        await prisma.location.update({
            where: { id: locationId },
            data: { isActive: false }
        });

        return NextResponse.json({ message: "Location deactivated" });
    } catch (error) {
        console.error("Error deactivating location:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
