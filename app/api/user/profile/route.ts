import { NextResponse } from 'next/server';
import { userService } from '@/services/UserService';
import { withAuth, AuthenticatedRequest } from '@/lib/api-middleware';
import { prisma } from '@/lib/prisma'; // Only needed for a generic GET

async function GET(req: AuthenticatedRequest) {
    try {
        const userProfile = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true, name: true, email: true, emailVerified: true,
                role: true, phoneNumber: true, gender: true, birthday: true,
                createdAt: true
            }
        });

        if (!userProfile) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user: userProfile });
    } catch (error) {
        console.error("Profile GET Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

async function PUT(req: AuthenticatedRequest) {
    try {
        const body = await req.json();
        const updatedUser = await userService.updateProfile(req.user.id, body);
        return NextResponse.json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: error.message?.includes("not found") ? 404 : 500 });
    }
}

export const GET_HANDLER = withAuth(GET);
export const PUT_HANDLER = withAuth(PUT);
export { GET_HANDLER as GET, PUT_HANDLER as PUT };
