import { NextResponse } from 'next/server';
import { adminService } from '@/services/AdminService';
import { withRole, AuthenticatedRequest } from '@/lib/api-middleware';

async function userActionHandler(req: AuthenticatedRequest, { params }: { params: { id: string } }) {
    try {
        const body = await req.json();

        // params.id is correctly passed from the dynamic route segment
        await adminService.setUserBanStatus(params.id, body);

        return NextResponse.json({ message: `User status updated successfully` }, { status: 200 });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        console.error(`Error updating user status:`, error);
        return NextResponse.json({ error: error.message || 'Error updating user status' }, { status: 500 });
    }
}

export const POST = withRole(['ADMIN'], userActionHandler);
