import { NextResponse } from 'next/server';
import { organizationService } from '@/services/OrganizationService';
import { withRole, AuthenticatedRequest } from '@/lib/api-middleware';

async function GET(req: AuthenticatedRequest) {
    try {
        if (!req.user.organizationId) {
            return NextResponse.json({ error: "No organization associated with user" }, { status: 400 });
        }

        const metrics = await organizationService.getMetrics(req.user.organizationId);
        return NextResponse.json(metrics, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching organization metrics:", error);
        return NextResponse.json({ error: "Error fetching metrics" }, { status: 500 });
    }
}

export const GET_HANDLER = withRole(['ORG_ADMIN', 'ADMIN'], GET);
export { GET_HANDLER as GET };
