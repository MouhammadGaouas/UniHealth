import { NextResponse } from 'next/server';
import { appointmentService } from '@/services/AppointmentService';
import { withRole, AuthenticatedRequest } from '@/lib/api-middleware';
import { prisma } from '@/lib/prisma'; // Only needed to get doctor ID from user ID

async function GET(req: AuthenticatedRequest) {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found for this user' }, { status: 404 });
    }

    const appointments = await appointmentService.getDoctorUpcomingAppointments(doctor.id);
    return NextResponse.json({ appointments }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching doctor appointments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const GET_HANDLER = withRole(['DOCTOR'], GET);
export { GET_HANDLER as GET };
