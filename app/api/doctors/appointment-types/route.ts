import { NextResponse, NextRequest } from "next/server";
import { doctorService } from "@/services/DoctorService";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId");

    if (!doctorId) {
      return NextResponse.json({ error: "Missing doctorId" }, { status: 400 });
    }

    const appointmentTypes = await doctorService.getAppointmentTypes(doctorId);
    return NextResponse.json({ appointmentTypes }, { status: 200 });
  } catch (error: any) {
    if (error.message === "Doctor not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error("Error fetching appointment types:", error);
    return NextResponse.json({ error: "Error fetching appointment types" }, { status: 500 });
  }
}