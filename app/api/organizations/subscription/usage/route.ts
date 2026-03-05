import { NextResponse, NextRequest } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/api-middleware";
import { getSubscriptionUsage } from "@/lib/subscription-limits";
import { prisma } from "@/lib/prisma";

async function GET(req: AuthenticatedRequest) {
    try {
        if (!req.user.organizationId) {
            return NextResponse.json({ error: "No organization associated with user" }, { status: 400 });
        }

        // This relies on an existing robust utility function
        const usage = await getSubscriptionUsage(req.user.organizationId);

        return NextResponse.json(usage);
    } catch (error) {
        console.error("Error fetching subscription usage:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export const GET_HANDLER = withAuth(GET);
export { GET_HANDLER as GET };
