import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma"
import { hashPassword } from "../../../../lib/hash"

export async function POST(req: Request) {
    const { name, email, password } = await req.json();
    const exists = await prisma.user.findUnique({
        where: { email }
    })

    if (exists) {
        return NextResponse.json(
            { message: "email is already exist" },
            { status: 400 }
        )
    }

    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashed
        }
    })

    return NextResponse.json(user , {status: 201});
}

