const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const source = 'Pondicherry';
    const destination = 'Bangalore';
    const date = '2026-02-22';
    const start = new Date(date + 'T00:00:00');
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const trips = await prisma.trip.findMany({
      where: {
        source: { contains: source },
        destination: { contains: destination },
        departure: { gte: start, lt: end },
      },
      include: { vehicle: true },
      orderBy: { departure: 'asc' },
    });

    console.log('Found', trips.length, 'trips');
    trips.forEach(t => console.log(t.id, t.source, '->', t.destination, t.departure.toISOString(), 'vehicleId:', t.vehicleId));
  } catch (e) {
    console.error(e);
  } finally {
    await (new PrismaClient()).$disconnect();
  }
})();
