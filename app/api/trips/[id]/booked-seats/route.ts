import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const tripId = parseInt(params.id, 10);

    if (isNaN(tripId)) {
      return NextResponse.json({ error: 'Invalid trip ID' }, { status: 400 });
    }

    // fetch passenger-level data when available
    let passengers: any[] = [];
    try {
      if (prisma && (prisma as any).passenger && typeof (prisma as any).passenger.findMany === 'function') {
        passengers = await (prisma as any).passenger.findMany({
          where: { booking: { tripId: tripId, status: { in: ['CONFIRMED', 'PENDING'] } } },
          select: { seat: true, gender: true }
        });
      }
    } catch (err) {
      console.error('passenger lookup skipped due to error or missing model', err);
      passengers = [];
    }

    if (passengers && passengers.length > 0) {
      const booked = passengers.map(p => ({ seat: p.seat, gender: p.gender }));
      return NextResponse.json({ bookedPassengers: booked });
    }

    // fallback to original behaviour if passenger table is empty
    const bookings = await prisma.booking.findMany({
      where: { tripId: tripId, status: { in: ['CONFIRMED', 'PENDING'] } },
      select: { seats: true }
    });
    const bookedSeats = bookings.flatMap((booking: { seats: string }) => {
      try { return JSON.parse(booking.seats) as string[]; } catch { return []; }
    });
    return NextResponse.json({ bookedSeats: Array.from(new Set(bookedSeats)) });
  } catch (error) {
    console.error('Error fetching booked seats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
