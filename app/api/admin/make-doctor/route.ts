import { NextResponse } from 'next/server';
import { adminService } from '@/services/AdminService';
import { withRole, AuthenticatedRequest } from '@/lib/api-middleware';

async function makeDoctorHandler(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const doctor = await adminService.promoteUserToDoctor(body);
    return NextResponse.json(
      { message: "User promoted to Doctor and default appointment types created", doctor },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    const message = error.message || "Internal server error";
    const status = message.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export const POST = withRole(['ADMIN'], makeDoctorHandler);
