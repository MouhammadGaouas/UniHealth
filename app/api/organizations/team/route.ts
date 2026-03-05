import { NextResponse } from 'next/server';
import { organizationService } from '@/services/OrganizationService';
import { withRole, AuthenticatedRequest } from '@/lib/api-middleware';

async function GET(req: AuthenticatedRequest) {
    try {
        if (!req.user.organizationId) {
            return NextResponse.json({ error: "No organization associated with user" }, { status: 400 });
        }
        const team = await organizationService.getTeam(req.user.organizationId);
        return NextResponse.json({ team });
    } catch (error: any) {
        console.error("Error fetching team:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

async function DELETE(req: AuthenticatedRequest) {
    try {
        if (!req.user.organizationId) {
            return NextResponse.json({ error: "No organization associated with user" }, { status: 400 });
        }

        const { searchParams } = new URL(req.url);
        const doctorId = searchParams.get('doctorId');

        if (!doctorId) {
            return NextResponse.json({ error: "Missing doctorId" }, { status: 400 });
        }

        await organizationService.removeDoctor(req.user.organizationId, doctorId);

        return NextResponse.json({ message: "Doctor removed from organization successfully" });
    } catch (error: any) {
        if (error.message.includes("not found")) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
        if (error.message.includes("Cannot remove")) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        console.error("Error removing doctor:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export const GET_HANDLER = withRole(['ORG_ADMIN', 'ADMIN'], GET);
export const DELETE_HANDLER = withRole(['ORG_ADMIN', 'ADMIN'], DELETE);
export { GET_HANDLER as GET, DELETE_HANDLER as DELETE };
