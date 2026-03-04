import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { enforceDoctorLimit } from "@/lib/subscription-limits";

/**
 * Get all doctors in the organization with their location assignments
 */
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
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phoneNumber: true
                    }
                },
                location: {
                    select: {
                        id: true,
                        name: true,
                        address: true
                    }
                },
                _count: {
                    select: {
                        appointments: true
                    }
                }
            },
            orderBy: { user: { name: "asc" } }
        });

        // Calculate resource allocation metrics
        const totalDoctors = doctors.length;
        const availableDoctors = doctors.filter(d => d.available).length;
        const doctorsWithLocation = doctors.filter(d => d.locationId).length;
        const doctorsWithoutLocation = totalDoctors - doctorsWithLocation;

        return NextResponse.json({
            doctors,
            metrics: {
                total: totalDoctors,
                available: availableDoctors,
                withLocation: doctorsWithLocation,
                withoutLocation: doctorsWithoutLocation
            }
        });
    } catch (error) {
        console.error("Error fetching resource allocation:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

/**
 * Assign a doctor to a location (resource allocation)
 */
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

        if (!user?.organizationId) {
            return NextResponse.json({ error: "No organization found" }, { status: 404 });
        }

        if (user.role !== "ORG_ADMIN" && user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { doctorId, locationId } = await req.json();

        if (!doctorId || !locationId) {
            return NextResponse.json({ 
                error: "doctorId and locationId are required" 
            }, { status: 400 });
        }

        // Verify doctor belongs to organization
        const doctor = await prisma.doctor.findUnique({
            where: { id: doctorId },
            select: { organizationId: true }
        });

        if (!doctor || doctor.organizationId !== user.organizationId) {
            return NextResponse.json({ 
                error: "Doctor not found in your organization" 
            }, { status: 404 });
        }

        // Verify location belongs to organization
        const location = await prisma.location.findUnique({
            where: { id: locationId },
            select: { organizationId: true, isActive: true }
        });

        if (!location || location.organizationId !== user.organizationId || !location.isActive) {
            return NextResponse.json({ 
                error: "Location not found in your organization" 
            }, { status: 404 });
        }

        // Update doctor's location assignment
        await prisma.doctor.update({
            where: { id: doctorId },
            data: { locationId }
        });

        return NextResponse.json({
            message: "Doctor assigned to location",
            doctorId,
            locationId
        });
    } catch (error) {
        console.error("Error assigning doctor to location:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

/**
 * Add a new doctor to the organization (with subscription limit check)
 */
export async function PUT(req: NextRequest) {
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

        const { userId, specialty, locationId, bio } = await req.json();

        if (!userId || !specialty) {
            return NextResponse.json({ 
                error: "userId and specialty are required" 
            }, { status: 400 });
        }

        // Check subscription limits
        try {
            await enforceDoctorLimit(user.organizationId);
        } catch (limitError: any) {
            return NextResponse.json({ error: limitError.message }, { status: 403 });
        }

        // Check if user is already a doctor
        const existingDoctor = await prisma.doctor.findUnique({
            where: { userId }
        });

        if (existingDoctor) {
            return NextResponse.json({ 
                error: "User is already a doctor" 
            }, { status: 400 });
        }

        // Check if user belongs to organization
        const targetUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { organizationId: true, role: true }
        });

        if (!targetUser || targetUser.organizationId !== user.organizationId) {
            return NextResponse.json({ 
                error: "User must belong to your organization" 
            }, { status: 400 });
        }

        // Create doctor profile and update user role
        const [doctor] = await prisma.$transaction([
            prisma.doctor.create({
                data: {
                    userId,
                    specialty,
                    bio: bio || null,
                    locationId: locationId || null,
                    organizationId: user.organizationId,
                    appointmentTypes: {
                        create: [
                            { name: "Quick Consultation", duration: 15, price: 0 },
                            { name: "Follow-up", duration: 30, price: 0 },
                            { name: "First Visit", duration: 45, price: 0 }
                        ]
                    }
                },
                include: {
                    user: { select: { name: true, email: true } }
                }
            }),
            prisma.user.update({
                where: { id: userId },
                data: { role: "DOCTOR" }
            })
        ]);

        return NextResponse.json({ doctor }, { status: 201 });
    } catch (error) {
        console.error("Error adding doctor:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
