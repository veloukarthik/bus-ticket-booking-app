import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: "Missing" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Invalid" }, { status: 401 });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return NextResponse.json({ error: "Invalid" }, { status: 401 });

  const token = signToken({ userId: user.id, email: user.email, isAdmin: user.isAdmin, organizationId: user.organizationId });
  return NextResponse.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, organizationId: user.organizationId },
  });
}
