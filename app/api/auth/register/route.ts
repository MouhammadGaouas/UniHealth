import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma"
import { hashPassword } from "../../../../lib/hash"

export async function POST(req: Request) {
    const {name , email , password } = await req.json();

    const exists = await prisma.user
}