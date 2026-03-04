import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOrganizationMetrics } from "@/lib/analytics";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
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

        // Only org admins and system admins can access metrics
        if (user.role !== "ORG_ADMIN" && user.role !== "ADMIN" && user.role !== "DOCTOR") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const metrics = await getOrganizationMetrics(user.organizationId);

        return NextResponse.json({ metrics });
    } catch (error) {
        console.error("Error fetching organization metrics:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
