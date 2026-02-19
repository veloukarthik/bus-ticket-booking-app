import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { authorization } = Object.fromEntries(req.headers.entries());
    const token = authorization?.replace("Bearer ", "") || null;
    const user = token ? verifyToken(token) : null;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { tripId, seats } = await req.json();
    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

    const seatArray = Array.isArray(seats) ? seats : (seats ? JSON.parse(seats) : []);
    const totalPrice = trip.price * (seatArray.length || 1);
    const booking = await prisma.booking.create({ data: { userId: user.userId, tripId, seats: JSON.stringify(seatArray), seatCount: seatArray.length || 1, totalPrice } });
    return NextResponse.json({ booking });
  } catch (err: any) {
    console.error('booking POST error', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const user = token ? verifyToken(token) : null;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bookings = await prisma.booking.findMany({ where: { userId: user.userId }, include: { trip: { include: { vehicle: true } } } });
  return NextResponse.json({ bookings });
}
