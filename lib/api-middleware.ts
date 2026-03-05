import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

type Role = "PATIENT" | "DOCTOR" | "ORG_ADMIN" | "ADMIN";

export interface AuthenticatedRequest extends NextRequest {
    user: {
        id: string;
        email: string;
        role: Role;
        organizationId?: string | null;
        [key: string]: any;
    };
}

/**
 * Middleware higher-order function to ensure the user is authenticated.
 */
export function withAuth(
    handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse> | NextResponse
) {
    return async (req: NextRequest, ...args: any[]) => {
        try {
            // In Next.js 15+, headers() must be awaited, but better-auth API accepts the request directly or headers
            const session = await auth.api.getSession({ headers: req.headers });

            if (!session?.user) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            // Decorate request with strongly-typed user
            const authReq = req as AuthenticatedRequest;
            authReq.user = session.user as AuthenticatedRequest["user"];

            return await handler(authReq, ...args);
        } catch (error) {
            console.error("Auth Middleware Error:", error);
            return NextResponse.json({ error: "Internal server error" }, { status: 500 });
        }
    };
}

/**
 * Middleware higher-order function to ensure the user has one of the required roles.
 */
export function withRole(
    allowedRoles: Role[],
    handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse> | NextResponse
) {
    return withAuth(async (req, ...args) => {
        if (!allowedRoles.includes(req.user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return await handler(req, ...args);
    });
}
