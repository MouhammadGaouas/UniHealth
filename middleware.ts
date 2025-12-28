import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (!token) return NextResponse.redirect(new URL('/login', req.url));

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!) as { role: string };

    // حماية صفحة الأدمن
    if (req.nextUrl.pathname.startsWith('/dashboard/admin') && user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/dashboard/admin/:path*'],
};
