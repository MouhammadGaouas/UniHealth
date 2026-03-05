import { NextResponse } from 'next/server';
import { adminService } from '@/services/AdminService';
import { withRole, AuthenticatedRequest } from '@/lib/api-middleware';

async function getStatsHandler(_req: AuthenticatedRequest) {
    try {
        const stats = await adminService.getPlatformStats();
        return NextResponse.json(stats, { status: 200 });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json({ error: 'Error fetching stats' }, { status: 500 });
    }
}

export const GET = withRole(['ADMIN'], getStatsHandler);
