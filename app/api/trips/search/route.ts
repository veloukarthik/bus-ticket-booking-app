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

    let trips = await prisma.trip.findMany({
      where,
      include: { vehicle: true },
      orderBy: { departure: 'asc' },
    });

    // If we got no results using Prisma filters (which may be case-sensitive on SQLite),
    // fall back to a case-insensitive raw SQL LIKE search (uses lower(...) on both sides).
    if (trips.length === 0 && (source || destination)) {
      const sParam = source ? `%${source.toLowerCase()}%` : '%';
      const dParam = destination ? `%${destination.toLowerCase()}%` : '%';

      // Parameterized raw query to avoid injection. We select vehicle fields and map them below
      const rows: any[] = await prisma.$queryRaw`
        SELECT t.id, t.vehicleId, t.source, t.destination, t.departure, t.arrival, t.price,
               v.id AS vehicle_id, v.name AS vehicle_name, v.number AS vehicle_number, v.capacity AS vehicle_capacity
        FROM Trip t
        JOIN Vehicle v ON v.id = t.vehicleId
        WHERE lower(t.source) LIKE ${sParam}
          AND lower(t.destination) LIKE ${dParam}
          AND t.departure >= ${where.departure?.gte ?? new Date(0)}
          AND t.departure < ${where.departure?.lt ?? new Date(8640000000000000)}
        ORDER BY t.departure ASC
      `;

      trips = rows.map((r) => ({
        id: r.id,
        vehicleId: r.vehicleId,
        source: r.source,
        destination: r.destination,
        departure: r.departure,
        arrival: r.arrival,
        price: r.price,
        vehicle: {
          id: r.vehicle_id,
          name: r.vehicle_name,
          number: r.vehicle_number,
          capacity: r.vehicle_capacity,
        },
      }));
    }

    return NextResponse.json({ trips });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}