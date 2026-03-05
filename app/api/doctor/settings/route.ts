import { NextResponse } from 'next/server';
import { doctorService } from '@/services/DoctorService';
import { withRole, AuthenticatedRequest } from '@/lib/api-middleware';

async function GET(req: AuthenticatedRequest) {
    try {
        const settings = await doctorService.getSettings(req.user.id);
        return NextResponse.json(settings);
    } catch (error: any) {
        if (error.message === "Doctor profile not found") {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
        console.error("Error fetching doctor settings:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

async function PUT(req: AuthenticatedRequest) {
    try {
        const body = await req.json();
        const updatedSettings = await doctorService.updateSettings(req.user.id, body);
        return NextResponse.json(updatedSettings);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        if (error.message === "Location not found or inactive") {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
        console.error("Error updating doctor settings:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export const GET_HANDLER = withRole(['DOCTOR'], GET);
export const PUT_HANDLER = withRole(['DOCTOR'], PUT);
export { GET_HANDLER as GET, PUT_HANDLER as PUT };
