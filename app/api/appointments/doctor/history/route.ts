import { NextResponse } from 'next/server';
import { appointmentService } from '@/services/AppointmentService';
import { withRole, AuthenticatedRequest } from '@/lib/api-middleware';

async function GET(req: AuthenticatedRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const queryParams = Object.fromEntries(searchParams.entries());

        const appointments = await appointmentService.getHistory(req.user.id, "DOCTOR", queryParams);
        return NextResponse.json({ appointments }, { status: 200 });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        if (error.message.includes("not found")) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
        console.error("Error fetching doctor history:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export const GET_HANDLER = withRole(['DOCTOR'], GET);
export { GET_HANDLER as GET };
