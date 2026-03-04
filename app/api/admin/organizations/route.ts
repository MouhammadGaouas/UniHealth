import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        if ((session.user as Record<string, unknown>).role !== "ADMIN") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";
        const type = searchParams.get("type") || "";

        const organizations = await prisma.organization.findMany({
            where: {
                AND: [
                    type ? { type: type as any } : {},
                    search ? {
                        name: { contains: search, mode: "insensitive" }
                    } : {}
                ]
            },
            include: {
                subscription: {
                    select: {
                        planTier: true,
                        status: true,
                        maxDoctors: true,
                        maxAppointmentsPerMonth: true,
                    }
                },
                _count: {
                    select: {
                        doctors: true,
                        locations: true,
                    }
                }
            },
            orderBy: { createdAt: "desc" },
            take: 50,
        });

        return NextResponse.json({ organizations }, { status: 200 });
    } catch (error) {
        console.error("Error fetching organizations:", error);
        return NextResponse.json(
            { message: "Error fetching organizations" },
            { status: 500 }
        );
    }
}
