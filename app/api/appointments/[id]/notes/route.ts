import { NextResponse } from 'next/server';
import { appointmentService } from '@/services/AppointmentService';
import { withAuth, AuthenticatedRequest } from '@/lib/api-middleware';

async function GET(req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const notes = await appointmentService.getNotes(id, req.user.id, req.user.role);
        return NextResponse.json({ notes }, { status: 200 });
    } catch (error: any) {
        if (error.message.includes("not found")) return NextResponse.json({ error: error.message }, { status: 404 });
        if (error.message.includes("Forbidden")) return NextResponse.json({ error: error.message }, { status: 403 });
        console.error("Error fetching notes:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

async function POST(req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // Only Doctors can create notes
        if (req.user.role !== 'DOCTOR') {
            return NextResponse.json({ error: "Forbidden: Only doctors can add notes" }, { status: 403 });
        }

        const { id } = await params;
        const body = await req.json();

        const note = await appointmentService.createNote(id, req.user.id, body);
        return NextResponse.json({ message: "Note added successfully", note }, { status: 201 });
    } catch (error: any) {
        if (error.name === 'ZodError') return NextResponse.json({ error: error.errors }, { status: 400 });
        const message = error.message || "Internal server error";
        const status = message.includes("Forbidden") ? 403 : message.includes("not found") ? 404 : 400;
        return NextResponse.json({ error: message }, { status });
    }
}

export const GET_HANDLER = withAuth(GET);
export const POST_HANDLER = withAuth(POST);
export { GET_HANDLER as GET, POST_HANDLER as POST };
