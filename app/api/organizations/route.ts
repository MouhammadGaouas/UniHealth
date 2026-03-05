import { NextResponse } from 'next/server';
import { organizationService } from '@/services/OrganizationService';
import { withAuth, AuthenticatedRequest } from '@/lib/api-middleware';

async function GET(req: AuthenticatedRequest) {
    try {
        const organization = await organizationService.getByUserId(req.user.id);
        return NextResponse.json({ organization });
    } catch (error: any) {
        if (error.message === "User does not belong to an organization") {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
        console.error("Error fetching organization:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

async function POST(req: AuthenticatedRequest) {
    try {
        const body = await req.json();
        const organization = await organizationService.createOrganization(req.user.id, body);

        return NextResponse.json({
            message: "Organization created successfully",
            organization
        }, { status: 201 });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        console.error("Error creating organization:", error);
        return NextResponse.json({
            error: error.message || "Internal server error"
        }, { status: 500 });
    }
}

export const GET_HANDLER = withAuth(GET);
export const POST_HANDLER = withAuth(POST);
export { GET_HANDLER as GET, POST_HANDLER as POST };
