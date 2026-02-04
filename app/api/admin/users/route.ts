import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const user = getAuthUser(req);

    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        requireRole(user, 'ADMIN');
    } catch {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const role = searchParams.get('role') || '';

        const users = await prisma.user.findMany({
            where: {
                AND: [
                    role ? { role: role as 'PATIENT' | 'DOCTOR' | 'ADMIN' } : {},
                    search ? {
                        OR: [
                            { name: { contains: search, mode: 'insensitive' } },
                            { email: { contains: search, mode: 'insensitive' } }
                        ]
                    } : {}
                ]
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        return NextResponse.json({ users }, { status: 200 });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { message: 'Error fetching users' },
            { status: 500 }
        );
    }
}
