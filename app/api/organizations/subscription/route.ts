import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { organizationId: true }
        });

        if (!user?.organizationId) {
            return NextResponse.json({ error: "No organization found" }, { status: 404 });
        }

        const subscription = await prisma.subscription.findFirst({
            where: { organizationId: user.organizationId }
        });

        if (!subscription) {
            return NextResponse.json({ error: "No subscription found" }, { status: 404 });
        }

        return NextResponse.json({ subscription });
    } catch (error) {
        console.error("Error fetching subscription:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
