import { NextResponse } from 'next/server';
import { appointmentService } from '@/services/AppointmentService';
import { withAuth, AuthenticatedRequest } from '@/lib/api-middleware';

async function GET(req: AuthenticatedRequest) {
    try {
        const appointments = await appointmentService.getMyUpcomingAppointments(req.user.id);
        return NextResponse.json({ appointments }, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching patient appointments:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export const GET_HANDLER = withAuth(GET);
export { GET_HANDLER as GET };