import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clean slate
  await prisma.booking.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  const vehiclesData = [
    { name: "Volvo B11R", number: "KA01AB1234", capacity: 40 },
    { name: "Ashok Leyland Viking", number: "KA02CD5678", capacity: 36 },
    { name: "Tata Starbus", number: "KA03EF9012", capacity: 50 },
  ];

  // Define routes with approximate durations (minutes) and prices
  const routes = [
    { source: "Bangalore", destination: "Mysore", durationMin: 180, price: 300, departHour: 9 },
    { source: "Chennai", destination: "Pondicherry", durationMin: 240, price: 450, departHour: 10 },
    { source: "Pondicherry", destination: "Bangalore", durationMin: 420, price: 750, departHour: 22, overnight: true },
    { source: "Pondicherry", destination: "Hyderabad", durationMin: 840, price: 1200, departHour: 18, overnight: true },
  ];

  const now = new Date();
  // create vehicles and multiple trips for each vehicle across the next 3 days
  let totalVehicles = 0;
  let totalTrips = 0;

  for (const v of vehiclesData) {
    const vehicle = await prisma.vehicle.create({ data: v });
    totalVehicles++;

    const tripCreates: Promise<any>[] = [];
    const days = 3; // today + next 2 days

    for (let dayOffset = 0; dayOffset < days; dayOffset++) {
      for (const r of routes) {
        const departure = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + dayOffset,
          r.departHour,
          r.departHour === 22 ? 30 : 0 // slight minutes offset for late departures when desired
        );

        let arrival = new Date(departure.getTime() + r.durationMin * 60 * 1000);
        // if overnight flag set and arrival falls into next day it's fine; dates handled by JS

        tripCreates.push(
          prisma.trip.create({
            data: {
              vehicleId: vehicle.id,
              source: r.source,
              destination: r.destination,
              departure,
              arrival,
              price: r.price,
            },
          })
        );
      }
    }

    const createdTrips = await Promise.all(tripCreates);
    totalTrips += createdTrips.length;
  }

  // Create an admin user
  const hashed = await bcrypt.hash("adminpass", 10);
  await prisma.user.create({ data: { name: "Admin", email: "admin@example.com", password: hashed, isAdmin: true } });

  console.log(`Seeded ${totalVehicles} vehicles and ${totalTrips} trips.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
