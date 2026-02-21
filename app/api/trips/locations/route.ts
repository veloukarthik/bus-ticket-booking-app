import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const rows = await prisma.trip.findMany({ select: { source: true, destination: true } });

    const sources = Array.from(new Set(rows.map(r => r.source).filter(Boolean))).sort();
    const destinations = Array.from(new Set(rows.map(r => r.destination).filter(Boolean))).sort();

    return NextResponse.json({ sources, destinations });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
