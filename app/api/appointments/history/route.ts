import { NextResponse } from 'next/server';
import { appointmentService } from '@/services/AppointmentService';
import { withAuth, AuthenticatedRequest } from '@/lib/api-middleware';

async function GET(req: AuthenticatedRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const queryParams = Object.fromEntries(searchParams.entries());

        const appointments = await appointmentService.getHistory(req.user.id, "PATIENT", queryParams);
        return NextResponse.json({ appointments }, { status: 200 });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        console.error("Error fetching appointment history:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export const GET_HANDLER = withAuth(GET);
export { GET_HANDLER as GET };
