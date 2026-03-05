import { NextResponse } from 'next/server';
import { organizationService } from '@/services/OrganizationService';
import { withRole, AuthenticatedRequest } from '@/lib/api-middleware';

async function GET(req: AuthenticatedRequest) {
    try {
        if (!req.user.organizationId) {
            return NextResponse.json({ error: "No organization associated with user" }, { status: 400 });
        }
        const locations = await organizationService.getLocations(req.user.organizationId);
        return NextResponse.json({ locations }, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching locations:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

async function POST(req: AuthenticatedRequest) {
    try {
        if (!req.user.organizationId) {
            return NextResponse.json({ error: "No organization associated with user" }, { status: 400 });
        }

        const body = await req.json();
        const location = await organizationService.addLocation(req.user.organizationId, body);

        return NextResponse.json({ message: "Location created successfully", location }, { status: 201 });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        console.error("Error creating location:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: error.message?.includes("limit reached") ? 403 : 500 });
    }
}

async function DELETE(req: AuthenticatedRequest) {
    try {
        if (!req.user.organizationId) {
            return NextResponse.json({ error: "No organization associated with user" }, { status: 400 });
        }

        const { searchParams } = new URL(req.url);
        const locationId = searchParams.get('locationId');

        if (!locationId) {
            return NextResponse.json({ error: "Missing locationId" }, { status: 400 });
        }

        await organizationService.deactivateLocation(req.user.organizationId, locationId);

        return NextResponse.json({ message: "Location deactivated successfully" }, { status: 200 });
    } catch (error: any) {
        if (error.message.includes("not found")) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
        if (error.message.includes("Cannot deactivate")) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        console.error("Error deactivating location:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export const GET_HANDLER = withRole(['ORG_ADMIN', 'ADMIN'], GET);
export const POST_HANDLER = withRole(['ORG_ADMIN', 'ADMIN'], POST);
export const DELETE_HANDLER = withRole(['ORG_ADMIN', 'ADMIN'], DELETE);
export { GET_HANDLER as GET, POST_HANDLER as POST, DELETE_HANDLER as DELETE };
