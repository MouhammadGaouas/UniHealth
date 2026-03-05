import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * Freelance doctor: Get their current practice location
 */
export async function GET() {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if ((session.user as Record<string, unknown>).role !== 'DOCTOR') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const doctor = await prisma.doctor.findUnique({
            where: { userId: session.user.id },
            include: {
                location: {
                    include: {
                        organization: {
                            select: {
                                name: true,
                                type: true
                            }
                        }
                    }
                },
                organization: {
                    select: {
                        name: true,
                        type: true
                    }
                }
            }
        });

        if (!doctor) {
            return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
        }

        return NextResponse.json({
            location: doctor.location,
            organization: doctor.organization
        });
    } catch (error) {
        console.error("Error fetching doctor location:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

/**
 * Freelance doctor: Add a practice location
 */
export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if ((session.user as Record<string, unknown>).role !== 'DOCTOR') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const doctor = await prisma.doctor.findUnique({
            where: { userId: session.user.id }
        });

        if (!doctor) {
            return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
        }

        const { locationId } = await req.json();

        if (!locationId) {
            return NextResponse.json({ error: "locationId is required" }, { status: 400 });
        }

        // Verify location exists and get its organization
        const location = await prisma.location.findUnique({
            where: { id: locationId },
            select: { organizationId: true, isActive: true }
        });

        if (!location || !location.isActive) {
            return NextResponse.json({ error: "Location not found or inactive" }, { status: 404 });
        }

        // Check if already associated with this location
        const existingAssociation = await prisma.doctor.findFirst({
            where: {
                userId: session.user.id,
                locationId
            }
        });

        if (existingAssociation) {
            return NextResponse.json({
                error: "Already associated with this location"
            }, { status: 400 });
        }

        // Add location to doctor's practice locations
        // Note: This creates a many-to-many relationship through a join table
        // For now, we'll update the doctor's primary location and track associations separately

        await prisma.doctor.update({
            where: { id: doctor.id },
            data: {
                locationId: locationId,
                organizationId: location.organizationId
            }
        });

        return NextResponse.json({
            message: "Location added to practice",
            locationId
        });
    } catch (error) {
        console.error("Error adding practice location:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

/**
 * Freelance doctor: Remove a practice location
 */
export async function DELETE(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if ((session.user as Record<string, unknown>).role !== 'DOCTOR') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const doctor = await prisma.doctor.findUnique({
            where: { userId: session.user.id }
        });

        if (!doctor) {
            return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
        }

        const { locationId } = await req.json();

        if (!locationId) {
            return NextResponse.json({ error: "locationId is required" }, { status: 400 });
        }

        // Remove location association (set to null, don't delete the location)
        await prisma.doctor.update({
            where: { id: doctor.id },
            data: {
                locationId: locationId === doctor.locationId ? null : doctor.locationId
            }
        });

        return NextResponse.json({
            message: "Location removed from practice"
        });
    } catch (error) {
        console.error("Error removing practice location:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
