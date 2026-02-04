import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireRole } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const userReq = getAuthUser(req);
    try {
      requireRole(userReq, "ADMIN");
    } catch {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { userId, specialty } = await req.json();

    if (!userId || !specialty) {
      return NextResponse.json(
        { message: "userId and specialty are required" },
        { status: 400 },
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if user is already a doctor
    if (user.role === "DOCTOR") {
      return NextResponse.json(
        { message: "User is already a doctor" },
        { status: 400 },
      );
    }

    // Update user role and create doctor profile in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { role: "DOCTOR" },
      }),
      prisma.doctor.create({
        data: {
          userId,
          specialty,
          available: true,
        },
      }),
    ]);

    return NextResponse.json(
      { message: "User promoted to Doctor" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error promoting user to doctor:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
