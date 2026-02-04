import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/book'];

// Role-specific route requirements
const roleRoutes: Record<string, string[]> = {
    '/dashboard/admin': ['ADMIN'],
    '/dashboard/doctor': ['DOCTOR'],
};

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if this is a protected route
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    if (!isProtectedRoute) {
        return NextResponse.next();
    }

    const token = request.cookies.get('token')?.value;

    // No token - redirect to login
    if (!token) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    try {
        // Verify JWT token
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        const userRole = payload.role as string;

        // Check role-specific routes
        for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
            if (pathname.startsWith(route)) {
                if (!allowedRoles.includes(userRole)) {
                    return NextResponse.redirect(new URL('/unauthorized', request.url));
                }
            }
        }

        // Allow access
        return NextResponse.next();
    } catch (error) {
        // Invalid token - redirect to login
        const response = NextResponse.redirect(new URL('/auth/login', request.url));
        response.cookies.delete('token');
        return response;
    }
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/book/:path*',
    ],
};
