import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveOrganizationId } from '@/lib/tenant';

export async function GET(req: Request) {
  try {
    const organizationId = resolveOrganizationId(req, true);
    if (!organizationId) return NextResponse.json({ error: 'Organization not resolved' }, { status: 400 });

    const rows = await prisma.trip.findMany({
      where: { organizationId },
      select: { source: true, destination: true },
    });

    const sources = Array.from(new Set(rows.map(r => r.source).filter(Boolean))).sort();
    const destinations = Array.from(new Set(rows.map(r => r.destination).filter(Boolean))).sort();

    return NextResponse.json({ sources, destinations });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
