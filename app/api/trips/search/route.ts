import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { source, destination, date } = await req.json();
  if (!source || !destination || !date) return NextResponse.json({ error: "Missing" }, { status: 400 });

  const start = new Date(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);

  const trips = await prisma.trip.findMany({
    where: {
      source: { equals: source },
      destination: { equals: destination },
      departure: { gte: start, lt: end },
    },
    include: { vehicle: true },
  });

  return NextResponse.json({ trips });
}
