import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
    try {
        const { name, email, password, phoneNumber, gender, birthday } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        // Validate gender if provided
        if (gender && !['MALE', 'FEMALE'].includes(gender)) {
            return NextResponse.json({ message: "Gender must be MALE or FEMALE" }, { status: 400 });
        }

        // Validate birthday if provided
        let parsedBirthday: Date | undefined;
        if (birthday) {
            parsedBirthday = new Date(birthday);
            if (isNaN(parsedBirthday.getTime())) {
                return NextResponse.json({ message: "Invalid birthday date" }, { status: 400 });
            }
        }

        const isExist = await prisma.user.findUnique({
            where: { email }
        });

        if (isExist) {
            return NextResponse.json({ message: "this email is already in use, try another email" }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phoneNumber: phoneNumber || undefined,
                gender: gender || undefined,
                birthday: parsedBirthday,
                role: 'PATIENT',
            },
        });

        // Exclude password from response
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
