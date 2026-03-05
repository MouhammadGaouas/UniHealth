import { NextResponse } from 'next/server';
import { appointmentService } from '@/services/AppointmentService';
import { withAuth, AuthenticatedRequest } from '@/lib/api-middleware';

async function PATCH(req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Status can be updated by PATIENT, DOCTOR, or ORG_ADMIN
    if (!['PATIENT', 'DOCTOR', 'ORG_ADMIN'].includes(req.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const appointment = await appointmentService.updateStatus(req.user.id, req.user.role, id, body);

    return NextResponse.json({ message: 'Status updated successfully', appointment }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    const message = error.message || "Internal server error";
    const status = message.includes("Forbidden") ? 403 :
      message.includes("not found") ? 404 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}

export const PATCH_HANDLER = withAuth(PATCH);
export { PATCH_HANDLER as PATCH };
