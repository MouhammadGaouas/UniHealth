import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
    const { name, email, password } = await req.json();

    const isExist = await prisma.user.findUnique({
        where: { email }
    })

    if (isExist) {
        return NextResponse.json({ message: "this email is already in use, try another email" })
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: 'PATIENT',
        },
    });

    return NextResponse.json({ user });
}
