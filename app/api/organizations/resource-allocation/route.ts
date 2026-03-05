import { NextResponse } from 'next/server';
import { organizationService } from '@/services/OrganizationService';
import { withRole, AuthenticatedRequest } from '@/lib/api-middleware';

async function POST(req: AuthenticatedRequest) {
    try {
        if (!req.user.organizationId) {
            return NextResponse.json({ error: "No organization associated with user" }, { status: 400 });
        }

        const body = await req.json();
        const doctor = await organizationService.assignDoctorToLocation(req.user.organizationId, body);

        return NextResponse.json({ message: "Doctor assigned to location successfully", doctor }, { status: 200 });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        if (error.message.includes("not found")) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
        console.error("Error assigning resource:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

async function PUT(req: AuthenticatedRequest) {
    try {
        if (!req.user.organizationId) {
            return NextResponse.json({ error: "No organization associated with user" }, { status: 400 });
        }

        const body = await req.json();
        const doctor = await organizationService.addDoctor(req.user.organizationId, body);

        return NextResponse.json({ message: "Doctor added to organization successfully", doctor }, { status: 200 });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        console.error("Error adding doctor to organization:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: error.message?.includes("limit reached") ? 403 : 400 });
    }
}

export const POST_HANDLER = withRole(['ORG_ADMIN', 'ADMIN'], POST);
export const PUT_HANDLER = withRole(['ORG_ADMIN', 'ADMIN'], PUT);
export { POST_HANDLER as POST, PUT_HANDLER as PUT };
