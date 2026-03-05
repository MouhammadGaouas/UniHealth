import { NextResponse } from 'next/server';
import { appointmentService } from '@/services/AppointmentService';
import { withRole, AuthenticatedRequest } from '@/lib/api-middleware';

async function POST(req: AuthenticatedRequest) {
    try {
        const body = await req.json();
        const appointment = await appointmentService.createAppointment(req.user.id, body);
        return NextResponse.json({ appointment }, { status: 201 });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        const message = error.message || "Internal server error";
        const status = message.includes("not found") ? 404 :
            message.includes("limit") || message.includes("available") ? 403 :
                message.includes("conflicts") ? 409 : 400;

        return NextResponse.json({ error: message }, { status });
    }
}

export const POST_HANDLER = withRole(['PATIENT', 'DOCTOR', 'ADMIN'], POST);
export { POST_HANDLER as POST };
