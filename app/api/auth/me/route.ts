import { NextResponse, NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth';

export function GET(req: NextRequest) {
  const user = getAuthUser(req);

  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  return NextResponse.json(user);
}
