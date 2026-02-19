import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminFromToken, getTokenFromAuthHeader } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const token = getTokenFromAuthHeader(req.headers as any);
    const admin = requireAdminFromToken(token);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const trips = await prisma.trip.findMany({ include: { vehicle: true } });
    return NextResponse.json({ trips });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const token = getTokenFromAuthHeader(req.headers as any);
    const admin = requireAdminFromToken(token);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { vehicleId, source, destination, departure, arrival, price } = await req.json();
    const t = await prisma.trip.create({ data: { vehicleId: Number(vehicleId), source, destination, departure: new Date(departure), arrival: new Date(arrival), price: Number(price) } });
    return NextResponse.json({ trip: t });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 401 });
  }
}
