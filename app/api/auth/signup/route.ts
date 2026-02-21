import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;
  if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Password policy: at least 8 chars, must include letters and numbers
  const pwd = (password || '').trim();
  const pwdValid = /(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}/.test(pwd);
  if (!pwdValid) return NextResponse.json({ error: "Password must be at least 8 characters and include letters and numbers" }, { status: 400 });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "User exists" }, { status: 409 });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hashed } });
    const token = signToken({ userId: user.id, email: user.email, isAdmin: user.isAdmin });
    return NextResponse.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (e: any) {
    console.error("Signup error:", e);
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
