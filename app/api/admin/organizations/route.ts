import { NextResponse } from 'next/server';
import { adminService } from '@/services/AdminService';
import { withRole, AuthenticatedRequest } from '@/lib/api-middleware';

async function getOrgsHandler(req: AuthenticatedRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const organizations = await adminService.getOrganizations({
            type: searchParams.get('type') as any || undefined,
            search: searchParams.get('search') || undefined,
        });
        return NextResponse.json({ organizations }, { status: 200 });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Error fetching organizations' }, { status: 500 });
    }
}

export const GET = withRole(['ADMIN'], getOrgsHandler);
