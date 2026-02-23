import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type RouteConfig = {
  source: string;
  destination: string;
  baseHour: number;
  baseMinute: number;
  durationMin: number;
  price: number;
};

const ROUTES: RouteConfig[] = [
  { source: "Pondicherry", destination: "Chennai", baseHour: 7, baseMinute: 0, durationMin: 180, price: 450 },
  { source: "Chennai", destination: "Pondicherry", baseHour: 10, baseMinute: 0, durationMin: 180, price: 450 },
  { source: "Pondicherry", destination: "Bangalore", baseHour: 21, baseMinute: 0, durationMin: 420, price: 850 },
  { source: "Bangalore", destination: "Pondicherry", baseHour: 20, baseMinute: 30, durationMin: 420, price: 850 },
  { source: "Pondicherry", destination: "Hyderabad", baseHour: 18, baseMinute: 0, durationMin: 780, price: 1400 },
  { source: "Hyderabad", destination: "Pondicherry", baseHour: 17, baseMinute: 30, durationMin: 780, price: 1400 },
  { source: "Chennai", destination: "Hyderabad", baseHour: 22, baseMinute: 0, durationMin: 660, price: 1200 },
  { source: "Hyderabad", destination: "Chennai", baseHour: 21, baseMinute: 0, durationMin: 660, price: 1200 },
  { source: "Chennai", destination: "Bangalore", baseHour: 14, baseMinute: 0, durationMin: 360, price: 800 },
  { source: "Bangalore", destination: "Chennai", baseHour: 13, baseMinute: 30, durationMin: 360, price: 800 },
];

const DEFAULT_VEHICLES = [
  { name: "Volvo B11R", number: "TN01AA1234", capacity: 40 },
  { name: "Scania K410", number: "TN01BB5678", capacity: 42 },
  { name: "Ashok Leyland Sleeper", number: "TN01CC9012", capacity: 36 },
];

function dayStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function deterministicOffsetMinutes(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 1_000_000_007;
  }
  // -60 to +60
  return (hash % 121) - 60;
}

async function ensureVehicles() {
  const owner = await prisma.user.findFirst({
    where: { isAdmin: true },
    orderBy: { id: "asc" },
  });
  let ownerId = owner?.id;
  if (!ownerId) {
    const hashed = await bcrypt.hash("ownerpass123", 10);
    const createdOwner = await prisma.user.create({
      data: {
        name: "Owner Admin",
        email: `owner-${Date.now()}@letsgo.local`,
        password: hashed,
        isAdmin: true,
        userType: "OWNER",
      },
    });
    ownerId = createdOwner.id;
  }

  const vehicles = await prisma.vehicle.findMany({ orderBy: { id: "asc" } });
  if (vehicles.length > 0) {
    const needsOwner = vehicles.filter((v) => !v.ownerId);
    if (needsOwner.length > 0) {
      await prisma.vehicle.updateMany({
        where: { ownerId: null },
        data: { ownerId },
      });
      return prisma.vehicle.findMany({ orderBy: { id: "asc" } });
    }
    return vehicles;
  }

  for (const vehicle of DEFAULT_VEHICLES) {
    await prisma.vehicle.create({ data: { ...vehicle, ownerId } });
  }
  return prisma.vehicle.findMany({ orderBy: { id: "asc" } });
}

async function main() {
  const vehicles = await ensureVehicles();
  const now = new Date();
  const start = dayStart(now);
  const end = new Date(start);
  end.setDate(end.getDate() + 30);

  const existingTrips = await prisma.trip.findMany({
    where: {
      OR: ROUTES.map((route) => ({ source: route.source, destination: route.destination })),
      departure: { gte: start, lt: end },
    },
    select: {
      source: true,
      destination: true,
      departure: true,
    },
  });

  const existingByRouteDay = new Set(
    existingTrips.map((trip) => {
      const dateKey = dayStart(trip.departure).toISOString().slice(0, 10);
      return `${trip.source}|${trip.destination}|${dateKey}`;
    })
  );

  const createOps: Promise<unknown>[] = [];
  let idx = 0;

  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    for (const route of ROUTES) {
      const date = new Date(start);
      date.setDate(start.getDate() + dayOffset);
      const dateKey = date.toISOString().slice(0, 10);
      const routeDayKey = `${route.source}|${route.destination}|${dateKey}`;
      if (existingByRouteDay.has(routeDayKey)) {
        continue;
      }

      const departure = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        route.baseHour,
        route.baseMinute,
        0,
        0
      );

      const seed = `${route.source}|${route.destination}|${date.toISOString().slice(0, 10)}`;
      departure.setMinutes(departure.getMinutes() + deterministicOffsetMinutes(seed));

      const arrival = new Date(departure.getTime() + route.durationMin * 60 * 1000);
      const vehicle = vehicles[idx % vehicles.length];
      idx++;

      createOps.push(
        prisma.trip.create({
          data: {
            vehicleId: vehicle.id,
            source: route.source,
            destination: route.destination,
            departure,
            arrival,
            price: route.price,
          },
        })
      );
      existingByRouteDay.add(routeDayKey);
    }
  }

  await Promise.all(createOps);
  console.log(`Created ${createOps.length} trips for next 30 days across ${ROUTES.length} routes.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
