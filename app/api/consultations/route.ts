import { NextResponse } from "next/server";
import { userService } from "@/services/UserService";
import { withAuth, AuthenticatedRequest } from "@/lib/api-middleware";

async function getConsultationsHandler(req: AuthenticatedRequest) {
    try {
        const notes = await userService.getConsultations(req.user.id, req.user.role);
        return NextResponse.json({ notes });
    } catch (error: any) {
        if (error.message === "Doctor profile not found") {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
        console.error("Error fetching consultations:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export const GET = withAuth(getConsultationsHandler);
