import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { source, destination, date } = await req.json();

    // Prevent searches where source and destination are identical
    if (source && destination) {
      const a = String(source).trim().toLowerCase();
      const b = String(destination).trim().toLowerCase();
      if (a && b && a === b) {
        return NextResponse.json({ error: 'Source and destination cannot be the same' }, { status: 400 });
      }
    }

    const where: any = {};

    if (source) {
      where.source = { contains: source, mode: 'insensitive' };
    }
    if (destination) {
      where.destination = { contains: destination, mode: 'insensitive' };
    }

    if (date) {
      // Filter by date range (start of day to end of day)
      // date string is expected as YYYY-MM-DD
      // parsing 'YYYY-MM-DD' in JS creates a UTC date; to avoid timezone shifts,
      // parse as local midnight by appending a time component without timezone.
      const start = new Date(`${date}T00:00:00`);
      const end = new Date(start);
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