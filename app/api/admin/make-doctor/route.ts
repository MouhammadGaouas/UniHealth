import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if ((session.user as Record<string, unknown>).role !== "ADMIN") {
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
          appointmentTypes: {
            create: [
              { name: "Quick Consultation", duration: 15, price: 0 },
              { name: "Follow-up", duration: 30, price: 0 },
              { name: "First Visit", duration: 45, price: 0 }
            ]
          }
        },
      }),
    ]);

    return NextResponse.json(
      { message: "User promoted to Doctor and default appointment types created" },
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
