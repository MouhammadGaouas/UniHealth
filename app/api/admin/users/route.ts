import { NextResponse } from 'next/server';
import { adminService } from '@/services/AdminService';
import { withRole, AuthenticatedRequest } from '@/lib/api-middleware';

async function getUsersHandler(req: AuthenticatedRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const users = await adminService.getUsers({
            role: searchParams.get('role') as any || undefined,
            search: searchParams.get('search') || undefined,
        });
        return NextResponse.json({ users }, { status: 200 });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Error fetching users' }, { status: 500 });
    }
}

export const GET = withRole(['ADMIN'], getUsersHandler);
