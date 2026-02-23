import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { source, destination, date } = await req.json();
    const src = String(source || '').trim();
    const dst = String(destination || '').trim();

    if (!src || !dst) {
      return NextResponse.json({ error: 'Source and destination are required' }, { status: 400 });
    }

    // Prevent searches where source and destination are identical
    if (src.toLowerCase() === dst.toLowerCase()) {
      return NextResponse.json({ error: 'Source and destination cannot be the same' }, { status: 400 });
    }

    const locations = await prisma.trip.findMany({ select: { source: true, destination: true } });
    const validCities = new Set<string>();
    locations.forEach((row) => {
      if (row.source) validCities.add(row.source.trim().toLowerCase());
      if (row.destination) validCities.add(row.destination.trim().toLowerCase());
    });

    if (!validCities.has(src.toLowerCase()) || !validCities.has(dst.toLowerCase())) {
      return NextResponse.json({ error: 'Please select valid source and destination from available cities' }, { status: 400 });
    }

    const where: any = {};

    where.source = { equals: src, mode: 'insensitive' };
    where.destination = { equals: dst, mode: 'insensitive' };

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
