import { NextResponse, NextRequest } from "next/server";
import { doctorService } from "@/services/DoctorService";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const data = await doctorService.getAvailability({
            doctorId: searchParams.get('doctorId') || "",
            date: searchParams.get('date') || ""
        });

        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        if (error.message === "Doctor not found") {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
        console.error("Error fetching availability:", error);
        return NextResponse.json({ error: "Error fetching availability" }, { status: 500 });
    }
}
