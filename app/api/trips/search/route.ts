import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { source, destination, date, sortBy } = await req.json();
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
      include: { vehicle: { include: { owner: { select: { id: true, name: true } } } } },
      orderBy: { departure: 'asc' },
    });

    const ownerIds = Array.from(new Set(trips.map((t) => t.vehicle.ownerId).filter(Boolean))) as number[];
    const reviewGroups = ownerIds.length > 0
      ? await prisma.review.groupBy({
          by: ["ownerId"],
          where: { ownerId: { in: ownerIds } },
          _avg: { rating: true },
          _count: { _all: true },
        })
      : [];

    const reviewMap = new Map<number, { avg: number; count: number }>();
    reviewGroups.forEach((g) => {
      reviewMap.set(g.ownerId, {
        avg: Number(g._avg.rating || 0),
        count: g._count._all || 0,
      });
    });

    const enrichedTrips = trips.map((t) => {
      const ownerId = t.vehicle.ownerId || 0;
      const review = reviewMap.get(ownerId);
      return {
        ...t,
        owner: t.vehicle.owner ? { id: t.vehicle.owner.id, name: t.vehicle.owner.name } : null,
        ownerRating: review ? Number(review.avg.toFixed(1)) : null,
        ownerReviewCount: review?.count || 0,
      };
    });

    const normalizedSort = String(sortBy || "price").toLowerCase();
    const sortedTrips = [...enrichedTrips].sort((a, b) => {
      if (normalizedSort === "rating") {
        const ar = a.ownerRating ?? -1;
        const br = b.ownerRating ?? -1;
        if (br !== ar) return br - ar;
        if (a.price !== b.price) return a.price - b.price;
        return new Date(a.departure).getTime() - new Date(b.departure).getTime();
      }

      if (a.price !== b.price) return a.price - b.price;
      const ar = a.ownerRating ?? -1;
      const br = b.ownerRating ?? -1;
      if (br !== ar) return br - ar;
      return new Date(a.departure).getTime() - new Date(b.departure).getTime();
    });

    return NextResponse.json({ trips: sortedTrips });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
