import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
    try {
        if (!process.env.JWT_SECRET) {
            return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
        }

        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ message: "Missing email or password" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        const response = NextResponse.json({ message: "Login successful" }, { status: 200 });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 86400, // 1 day
            path: '/',
        });

        return response;

    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
