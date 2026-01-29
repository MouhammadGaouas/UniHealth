import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeToken(token: string) {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as { id: string; role: string; email?: string; name?: string };
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  // Only protect dashboard routes
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  const user = decodeToken(token);

  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  const path = req.nextUrl.pathname;

  // Check admin dashboard routes
  if (path.startsWith('/dashboard/admin') && user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  // Check doctor dashboard routes
  if (path.startsWith('/dashboard/doctor') && user.role !== 'DOCTOR') {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
