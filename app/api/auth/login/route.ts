import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique(
        { where: { email } }
    );
    if (!user) {
        return NextResponse.json(
            { message: 'Invalid credentials' },
            { status: 401 }
        );
    }

    const valid = await bcrypt.compare(password, user.password);


    if (!valid) {
        return NextResponse.json(
            { message: 'Invalid credentials' },
            { status: 401 }
        );
    }

    const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
    );

    const res = NextResponse.json({ message: 'Logged in' });


    res.cookies.set({
        name: 'token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
    });

    return res;
}
