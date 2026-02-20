import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { source, destination, date } = await req.json();

    const where: any = {};

    if (source) {
      where.source = { contains: source };
    }
    if (destination) {
      where.destination = { contains: destination };
    }

    if (date) {
      // Filter by date range (start of day to end of day)
      // date string is YYYY-MM-DD
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);

      if (!isNaN(start.getTime())) {
        where.departure = {
          gte: start,
          lt: end,
        };
      }
    }

    const trips = await prisma.trip.findMany({
      where,
      include: { vehicle: true },
      orderBy: { departure: 'asc' },
    });

    return NextResponse.json({ trips });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}