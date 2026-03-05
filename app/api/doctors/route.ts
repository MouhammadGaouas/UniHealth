import { NextResponse, NextRequest } from "next/server";
import { doctorService } from "@/services/DoctorService";

export async function GET(_req: NextRequest) {
    try {
        const doctors = await doctorService.getAllDoctors();
        return NextResponse.json({ doctors }, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching doctors:", error);
        return NextResponse.json({ error: "Error fetching doctors" }, { status: 500 });
    }
}
