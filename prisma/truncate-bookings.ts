import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Truncating Booking table...');
  // SQLite does not support TRUNCATE, so we use deleteMany to remove all records
  const { count } = await prisma.booking.deleteMany({});
  console.log(`Deleted ${count} bookings.`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());