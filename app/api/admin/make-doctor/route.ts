import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, requireRole } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const userReq = getAuthUser(req);
  try {
    requireRole(userReq, 'ADMIN');
  } catch {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const { userId, specialty } = await req.json();

  console.log(userId, specialty)

  await prisma.user.update({
    where: { id: userId },
    data: { role: 'DOCTOR' },
  });

  await prisma.doctor.create({
    data: {
      userId,
      specialty,
      available: true,
    },
  });

  return NextResponse.json({ message: 'User promoted to Doctor' });
}

