const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  await prisma.booking.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  const vehicle = await prisma.vehicle.create({ data: { name: 'Volvo B11R', number: 'KA01AB1234', capacity: 40 } });

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  await prisma.trip.create({ data: { vehicleId: vehicle.id, source: 'Bangalore', destination: 'Mysore', departure: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0), arrival: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0), price: 300 } });
  await prisma.trip.create({ data: { vehicleId: vehicle.id, source: 'Bangalore', destination: 'Mysore', departure: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 9, 0), arrival: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 12, 0), price: 300 } });

  const hashed = await bcrypt.hash('adminpass', 10);
  await prisma.user.create({ data: { name: 'Admin', email: 'admin@example.com', password: hashed, isAdmin: true } });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
