import { NextResponse } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/lib/api-middleware';
import { notificationService } from '@/lib/notifications';
import { bulkNotificationSchema } from '@/lib/schemas';

async function POST(req: AuthenticatedRequest) {
    try {
        let hoursBefore = 24; // Default
        try {
            const body = await req.json();
            const parsed = bulkNotificationSchema.parse(body);
            hoursBefore = parsed.hoursBefore;
        } catch (e) {
            // Ignore JSON parse errors here, just use the default 24 if no body is provided
        }

        const result = await notificationService.sendBulkReminders(hoursBefore);
        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        console.error("Error in bulk reminders route:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export const POST_HANDLER = withRole(['ADMIN'], POST);
export { POST_HANDLER as POST };
