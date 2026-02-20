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

    const bookings = await prisma.booking.findMany({
      where: {
        tripId: tripId,
        status: { in: ['CONFIRMED', 'PENDING'] },
      },
      select: {
        seats: true,
      },
    });

    const bookedSeats = bookings.flatMap((booking: { seats: string }) => {
      try {
        return JSON.parse(booking.seats) as string[];
      } catch {
        return [];
      }
    });

    return NextResponse.json({ bookedSeats: Array.from(new Set(bookedSeats)) });
  } catch (error) {
    console.error('Error fetching booked seats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
