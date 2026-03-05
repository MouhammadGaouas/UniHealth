import { NextResponse, NextRequest } from "next/server";
import { organizationService } from "@/services/OrganizationService";
import { withAuth, AuthenticatedRequest } from "@/lib/api-middleware";

async function GET(req: AuthenticatedRequest) {
    try {
        if (!req.user.organizationId) {
            return NextResponse.json({ error: "No organization associated with user" }, { status: 400 });
        }

        const org = await organizationService.getByUserId(req.user.id);
        const activeSubscription = org?.subscription || null;

        return NextResponse.json({ subscription: activeSubscription });
    } catch (error) {
        console.error("Error fetching subscription:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export const GET_HANDLER = withAuth(GET);
export { GET_HANDLER as GET };
