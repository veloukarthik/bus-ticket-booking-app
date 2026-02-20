import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

function getUserFromRequest(req: Request) {
  const url = new URL(req.url);
  let token = url.searchParams.get('token');
  
  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) return null;
  const payload = verifyToken(token);
  return payload ? payload.userId : null;
}

export async function GET(req: Request) {
  const userId = getUserFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: { trip: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ bookings });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userId = getUserFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    let body: any;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const { tripId, seats } = body;

    if (!tripId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return NextResponse.json({ error: 'Invalid booking data' }, { status: 400 });
    }

    // Check availability: Prevent double booking
    // We check for any booking that is CONFIRMED or PENDING
    const existing = await prisma.booking.findMany({
      where: {
        tripId: Number(tripId),
        status: { in: ['CONFIRMED', 'PENDING'] }
      },
      select: { seats: true }
    });

    const occupied = new Set<string>();
    existing.forEach((b: { seats: string }) => {
      try {
        const s = JSON.parse(b.seats);
        if (Array.isArray(s)) s.forEach((seat: string) => occupied.add(seat));
      } catch (e) {}
    });

    const conflict = seats.some(s => occupied.has(s));
    if (conflict) {
      return NextResponse.json({ error: 'One or more selected seats are already booked.' }, { status: 409 });
    }

  // Normalize and validate IDs
  const tripIdNum = Number(tripId);
  const userIdNum = Number(userId);
  if (isNaN(tripIdNum)) return NextResponse.json({ error: 'Invalid trip id' }, { status: 400 });
  if (isNaN(userIdNum)) return NextResponse.json({ error: 'Invalid user id' }, { status: 401 });

  // Verify trip and user exist to avoid FK errors
  const trip = await prisma.trip.findUnique({ where: { id: tripIdNum } });
  if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
  const user = await prisma.user.findUnique({ where: { id: userIdNum } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 401 });

    const booking = await prisma.booking.create({
      data: {
        userId: userIdNum,
        tripId: tripIdNum,
        seats: JSON.stringify(seats),
        seatCount: seats.length,
        totalPrice: trip.price * seats.length,
        status: 'PENDING',
        tripDate: trip.departure,
      }
    });

    return NextResponse.json({ booking });
  } catch (e: any) {
    console.error('Bookings POST error:', e);
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}