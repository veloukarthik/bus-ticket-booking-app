import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type OwnerSeed = {
  name: string;
  email: string;
  targetRating: number;
};

type RouteSeed = {
  source: string;
  destination: string;
  durationMin: number;
  baseFare: number;
  baseHour: number;
};

const OWNERS: OwnerSeed[] = [
  { name: "Arun Cabs", email: "owner.arun@letsgo.local", targetRating: 4.7 },
  { name: "Priya Rides", email: "owner.priya@letsgo.local", targetRating: 4.5 },
  { name: "Karthik Travels", email: "owner.karthik@letsgo.local", targetRating: 4.2 },
  { name: "Nila Mobility", email: "owner.nila@letsgo.local", targetRating: 4.8 },
];

const VEHICLE_MODELS = [
  { name: "Swift Dzire", capacity: 4 },
  { name: "Toyota Etios", capacity: 4 },
  { name: "Innova Crysta", capacity: 6 },
  { name: "Ertiga Tour", capacity: 6 },
];

const ROUTES: RouteSeed[] = [
  { source: "Pondicherry", destination: "Chennai", durationMin: 180, baseFare: 2100, baseHour: 6 },
  { source: "Chennai", destination: "Pondicherry", durationMin: 180, baseFare: 2100, baseHour: 10 },
  { source: "Pondicherry", destination: "Bangalore", durationMin: 420, baseFare: 5200, baseHour: 19 },
  { source: "Bangalore", destination: "Pondicherry", durationMin: 420, baseFare: 5200, baseHour: 18 },
  { source: "Pondicherry", destination: "Hyderabad", durationMin: 650, baseFare: 7100, baseHour: 20 },
  { source: "Hyderabad", destination: "Pondicherry", durationMin: 650, baseFare: 7100, baseHour: 21 },
  { source: "Chennai", destination: "Hyderabad", durationMin: 660, baseFare: 6800, baseHour: 20 },
  { source: "Hyderabad", destination: "Chennai", durationMin: 660, baseFare: 6800, baseHour: 21 },
  { source: "Chennai", destination: "Bangalore", durationMin: 360, baseFare: 4300, baseHour: 7 },
  { source: "Bangalore", destination: "Chennai", durationMin: 360, baseFare: 4300, baseHour: 8 },
];

const FARE_TIERS = [
  { key: "LOW", multiplier: 0.82, minuteOffset: -35 },
  { key: "STANDARD", multiplier: 1.0, minuteOffset: 0 },
  { key: "HIGH", multiplier: 1.24, minuteOffset: 28 },
];

function ymd(date: Date) {
  return date.toISOString().slice(0, 10);
}

function roundToNearest10(value: number) {
  return Math.max(100, Math.round(value / 10) * 10);
}

async function ensureOwner(owner: OwnerSeed) {
  const hashed = await bcrypt.hash("ownerpass123", 10);
  return prisma.user.upsert({
    where: { email: owner.email },
    update: { userType: "OWNER", isAdmin: true, name: owner.name },
    create: {
      name: owner.name,
      email: owner.email,
      password: hashed,
      userType: "OWNER",
      isAdmin: true,
    },
  });
}

async function ensureOwnerVehicles(ownerId: number, ownerIdx: number) {
  const existing = await prisma.vehicle.findMany({
    where: { ownerId },
    orderBy: { id: "asc" },
  });
  if (existing.length >= 2) return existing;

  const toCreate = 2 - existing.length;
  for (let i = 0; i < toCreate; i++) {
    const model = VEHICLE_MODELS[(ownerIdx * 2 + i) % VEHICLE_MODELS.length];
    const number = `TN${(ownerIdx + 1).toString().padStart(2, "0")}MC${(i + 1).toString().padStart(2, "0")}${(ownerId % 90) + 10}`;
    await prisma.vehicle.create({
      data: {
        ownerId,
        name: model.name,
        number,
        capacity: model.capacity,
      },
    });
  }

  return prisma.vehicle.findMany({ where: { ownerId }, orderBy: { id: "asc" } });
}

async function seedTrips(ownersWithVehicles: Array<{ ownerId: number; vehicleIds: number[] }>) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const days = 30;
  let created = 0;

  for (let day = 0; day < days; day++) {
    for (let routeIdx = 0; routeIdx < ROUTES.length; routeIdx++) {
      const route = ROUTES[routeIdx];

      for (let tierIdx = 0; tierIdx < FARE_TIERS.length; tierIdx++) {
        const tier = FARE_TIERS[tierIdx];
        const ownerRef = ownersWithVehicles[(day + routeIdx + tierIdx) % ownersWithVehicles.length];
        const vehicleId = ownerRef.vehicleIds[(day + tierIdx) % ownerRef.vehicleIds.length];

        const departure = new Date(
          start.getFullYear(),
          start.getMonth(),
          start.getDate() + day,
          route.baseHour,
          tier.minuteOffset,
          0,
          0
        );
        const arrival = new Date(departure.getTime() + route.durationMin * 60 * 1000);
        const price = roundToNearest10(route.baseFare * tier.multiplier);

        const exists = await prisma.trip.findFirst({
          where: {
            vehicleId,
            source: route.source,
            destination: route.destination,
            departure,
            price,
          },
          select: { id: true },
        });

        if (!exists) {
          await prisma.trip.create({
            data: {
              vehicleId,
              source: route.source,
              destination: route.destination,
              departure,
              arrival,
              price,
            },
          });
          created++;
        }
      }
    }
  }

  return created;
}

async function ensureCustomers() {
  const hashed = await bcrypt.hash("customerpass123", 10);
  const emails = ["customer.one@letsgo.local", "customer.two@letsgo.local", "customer.three@letsgo.local"];
  const users = [];
  for (const [idx, email] of emails.entries()) {
    const user = await prisma.user.upsert({
      where: { email },
      update: { userType: "CUSTOMER", isAdmin: false, name: `Customer ${idx + 1}` },
      create: {
        name: `Customer ${idx + 1}`,
        email,
        password: hashed,
        userType: "CUSTOMER",
        isAdmin: false,
      },
    });
    users.push(user);
  }
  return users;
}

async function seedOwnerReviews(
  owners: Array<{ id: number; targetRating: number }>,
  customers: Array<{ id: number }>
) {
  let created = 0;
  for (const owner of owners) {
    const existingCount = await prisma.review.count({ where: { ownerId: owner.id } });
    if (existingCount >= 8) {
      continue;
    }

    const ownerVehicle = await prisma.vehicle.findFirst({
      where: { ownerId: owner.id },
      select: { id: true },
      orderBy: { id: "asc" },
    });
    if (!ownerVehicle) continue;

    const pending = 8 - existingCount;
    for (let i = 0; i < pending; i++) {
      const customer = customers[(owner.id + i) % customers.length];
      const departure = new Date();
      departure.setDate(departure.getDate() - (10 + i));
      departure.setHours(7 + (i % 3), 0, 0, 0);
      const arrival = new Date(departure.getTime() + 3 * 60 * 60 * 1000);

      const trip = await prisma.trip.create({
        data: {
          vehicleId: ownerVehicle.id,
          source: "Chennai",
          destination: "Pondicherry",
          departure,
          arrival,
          price: 2000 + i * 50,
        },
      });

      const booking = await prisma.booking.create({
        data: {
          userId: customer.id,
          tripId: trip.id,
          seats: JSON.stringify(["1A"]),
          seatCount: 1,
          totalPrice: trip.price,
          isPaid: true,
          paidAt: new Date(departure.getTime() - 60 * 60 * 1000),
          status: "CONFIRMED",
          tripDate: departure,
        },
      });

      const jitter = ((i % 3) - 1) * 0.2;
      const rating = Math.min(5, Math.max(1, Math.round((owner.targetRating + jitter) * 10) / 10));
      await prisma.review.create({
        data: {
          ownerId: owner.id,
          customerId: customer.id,
          bookingId: booking.id,
          rating: Math.round(rating),
          comment: `Ride was ${rating >= 4 ? "great" : "okay"} on ${ymd(departure)}.`,
        },
      });
      created++;
    }
  }
  return created;
}

async function main() {
  const ownerUsers: Array<{ id: number; targetRating: number }> = [];
  const ownersWithVehicles: Array<{ ownerId: number; vehicleIds: number[] }> = [];

  for (const [idx, owner] of OWNERS.entries()) {
    const user = await ensureOwner(owner);
    const vehicles = await ensureOwnerVehicles(user.id, idx);
    ownerUsers.push({ id: user.id, targetRating: owner.targetRating });
    ownersWithVehicles.push({ ownerId: user.id, vehicleIds: vehicles.map((v) => v.id) });
  }

  const tripCount = await seedTrips(ownersWithVehicles);
  const customers = await ensureCustomers();
  const reviewCount = await seedOwnerReviews(ownerUsers, customers);

  console.log(`Marketplace seed complete: ${ownersWithVehicles.length} owners, ${tripCount} trips, ${reviewCount} reviews.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
