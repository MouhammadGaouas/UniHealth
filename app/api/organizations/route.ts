import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getDefaultSubscriptionPlan } from "@/lib/subscription";
import { enforceDoctorLimit, enforceLocationLimit } from "@/lib/subscription-limits";

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

        const organization = await prisma.organization.findUnique({
            where: { id: user.organizationId },
            include: {
                subscription: true,
                _count: { select: { doctors: true, locations: true } }
            }
        });

        return NextResponse.json({ organization });
    } catch (error) {
        console.error("Error fetching organization:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, type, planTier } = await req.json();

        if (!name?.trim() || !type) {
            return NextResponse.json({ error: "Organization name and type are required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (user?.organizationId) {
            return NextResponse.json({ error: "User already belongs to an organization" }, { status: 400 });
        }
        if (user?.role === "DOCTOR" || user?.role === "ADMIN") {
            return NextResponse.json({ error: "Doctors and system admins cannot create organizations" }, { status: 403 });
        }

        const defaultPlanParams = getDefaultSubscriptionPlan(planTier || "STARTER");

        const organization = await prisma.organization.create({
            data: {
                name: name.trim(),
                type,
                users: { connect: { id: session.user.id } },
                subscription: {
                    create: {
                        planTier: planTier || "STARTER",
                        status: "ACTIVE",
                        billingCycle: "MONTHLY",
                        maxDoctors: defaultPlanParams.maxDoctors,
                        maxAppointmentsPerMonth: defaultPlanParams.maxAppointmentsPerMonth,
                        features: defaultPlanParams.features,
                    }
                }
            },
            include: {
                subscription: true,
                _count: { select: { doctors: true, locations: true } }
            }
        });

        // Promote user to ORG_ADMIN
        await prisma.user.update({
            where: { id: session.user.id },
            data: { role: "ORG_ADMIN", organizationId: organization.id }
        });

        return NextResponse.json({ organization }, { status: 201 });
    } catch (error) {
        console.error("Error creating organization:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
