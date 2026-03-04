import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { phoneNumber, gender, birthday, name } = await req.json();

        const updateData: Record<string, string | null | Date> = {};
        if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber || null;
        if (gender !== undefined) updateData.gender = gender || null;
        if (birthday !== undefined) updateData.birthday = birthday ? new Date(birthday) : null;
        if (name !== undefined) updateData.name = name || null;

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                gender: true,
                birthday: true,
                role: true,
            },
        });

        return NextResponse.json({ user: updatedUser });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                gender: true,
                birthday: true,
                role: true,
                image: true,
                emailVerified: true,
                createdAt: true,
            },
        });

        return NextResponse.json({ user });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
