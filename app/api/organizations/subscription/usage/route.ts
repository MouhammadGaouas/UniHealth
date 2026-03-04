import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getSubscriptionUsage } from "@/lib/subscription-limits";

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

        const usage = await getSubscriptionUsage(user.organizationId);

        return NextResponse.json({ usage });
    } catch (error) {
        console.error("Error fetching subscription usage:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
