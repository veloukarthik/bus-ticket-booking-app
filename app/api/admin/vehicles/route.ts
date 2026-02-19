import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminFromToken, getTokenFromAuthHeader } from "@/lib/auth";

export async function GET(req: Request) {
  const token = getTokenFromAuthHeader(req.headers as any);
  const admin = requireAdminFromToken(token);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vehicles = await prisma.vehicle.findMany();
  return NextResponse.json({ vehicles });
}

export async function POST(req: Request) {
  const token = getTokenFromAuthHeader(req.headers as any);
  const admin = requireAdminFromToken(token);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, number, capacity } = await req.json();
  const v = await prisma.vehicle.create({ data: { name, number, capacity: Number(capacity) || 0 } });
  return NextResponse.json({ vehicle: v });
}
