import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting backfill of tripDate...');
  const bookings = await prisma.booking.findMany({
    where: { tripDate: null },
    include: { trip: true },
  });

  console.log(`Found ${bookings.length} bookings to update.`);

  for (const booking of bookings) {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { tripDate: booking.trip.departure },
    });
  }

  console.log('Backfill complete.');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());