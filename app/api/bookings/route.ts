import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

function getAuthContext(req: Request) {
  const url = new URL(req.url);
  let token = url.searchParams.get('token');
  
  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) return null;
  const payload = verifyToken(token) as any;
  if (!payload?.userId || !payload?.organizationId) return null;
  return { userId: Number(payload.userId), organizationId: Number(payload.organizationId) };
}

export async function GET(req: Request) {
  const auth = getAuthContext(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const bookings = await (prisma as any).booking.findMany({
      where: { userId: auth.userId, organizationId: auth.organizationId },
      include: { trip: true, passengers: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ bookings });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = getAuthContext(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    let body: any;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const { tripId, seats, passengers } = body;

    // support old clients that send only seats array
    const seatsArray = Array.isArray(seats) ? seats : (Array.isArray(passengers) ? passengers.map((p: any) => p.seat) : []);

    if (!tripId || !seatsArray || !Array.isArray(seatsArray) || seatsArray.length === 0) {
      return NextResponse.json({ error: 'Invalid booking data' }, { status: 400 });
    }

    // Check availability: Prevent double booking
    // We check for any booking that is CONFIRMED or PENDING
    const existing = await prisma.booking.findMany({
      where: {
        tripId: Number(tripId),
        organizationId: auth.organizationId,
        status: { in: ['CONFIRMED', 'PENDING'] }
      },
      select: { seats: true }
    });

    const occupied = new Set<string>();
    existing.forEach((b: { seats: string }) => {
      try {
        const s = JSON.parse(b.seats);
        if (Array.isArray(s)) s.forEach((seat: string) => occupied.add(seat));
      } catch (e) {}
    });

    const conflict = seatsArray.some(s => occupied.has(s));
    if (conflict) {
      return NextResponse.json({ error: 'One or more selected seats are already booked.' }, { status: 409 });
    }

    // Additional rule: if a female has already booked one seat of a 2-seater pair (B/C), disallow a male passenger booking the adjacent seat
    // We'll inspect existing passengers (if present) for gender info
    let existingPassengers: any[] = [];
    try {
      if (prisma && (prisma as any).passenger && typeof (prisma as any).passenger.findMany === 'function') {
        existingPassengers = await (prisma as any).passenger.findMany({
          where: {
            booking: {
              tripId: Number(tripId),
              organizationId: auth.organizationId,
              status: { in: ['CONFIRMED', 'PENDING'] },
            },
          },
          select: { seat: true, gender: true }
        });
      }
    } catch (err) {
      console.error('passenger lookup skipped due to error or missing model', err);
      existingPassengers = [];
    }

    const existingGenderMap = new Map<string, string>();
    existingPassengers.forEach((p: any) => existingGenderMap.set(p.seat, p.gender));

    // helper to get pair partner for seats like '1B' <-> '1C'
    function partnerSeat(seat: string) {
      if (!seat) return '';
      const last = seat.slice(-1).toUpperCase();
      if (last === 'B') return seat.slice(0, -1) + 'C';
      if (last === 'C') return seat.slice(0, -1) + 'B';
      return '';
    }

    // check conflicts between requested passengers and existing passengers
    if (Array.isArray(passengers)) {
      for (const p of passengers) {
        const partner = partnerSeat(p.seat);
        const partnerGender = existingGenderMap.get(partner);
        if (partnerGender === 'Female' && p.gender && p.gender.toLowerCase() === 'male') {
          return NextResponse.json({ error: `Cannot book seat ${p.seat} as male because adjacent seat ${partner} is booked by female.` }, { status: 409 });
        }
      }

      // also check intra-request conflicts (one passenger in same request booking B female and other booking C male)
      const requestGenderMap = new Map<string, string>();
      passengers.forEach((p: any) => requestGenderMap.set(p.seat, p.gender));
      for (const p of passengers) {
        const partner = partnerSeat(p.seat);
        const partnerGender = requestGenderMap.get(partner);
        if (partnerGender === 'Female' && p.gender && p.gender.toLowerCase() === 'male') {
          return NextResponse.json({ error: `Cannot book seat ${p.seat} as male because adjacent seat ${partner} in same request is booked by female.` }, { status: 409 });
        }
      }
    }

  // Normalize and validate IDs
  const tripIdNum = Number(tripId);
  const userIdNum = Number(auth.userId);
  if (isNaN(tripIdNum)) return NextResponse.json({ error: 'Invalid trip id' }, { status: 400 });
  if (isNaN(userIdNum)) return NextResponse.json({ error: 'Invalid user id' }, { status: 401 });

  // Verify trip and user exist to avoid FK errors
  const trip = await prisma.trip.findFirst({ where: { id: tripIdNum, organizationId: auth.organizationId } });
  if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
  const user = await prisma.user.findFirst({ where: { id: userIdNum, organizationId: auth.organizationId } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 401 });

    const booking = await prisma.booking.create({
      data: {
        organizationId: auth.organizationId,
        userId: userIdNum,
        tripId: tripIdNum,
        seats: JSON.stringify(seatsArray),
        seatCount: seatsArray.length,
        totalPrice: trip.price * seatsArray.length,
        status: 'PENDING',
        tripDate: trip.departure,
      }
    });

    // create passenger records if provided
    if (Array.isArray(passengers) && passengers.length > 0) {
      const pdata = passengers.map((p: any) => ({
        bookingId: booking.id,
        name: p.name || '',
        age: p.age ? Number(p.age) : null,
        mobile: p.mobile || '',
        gender: p.gender || '',
        seat: p.seat || ''
      }));
      try {
        if (prisma && (prisma as any).passenger && typeof (prisma as any).passenger.createMany === 'function') {
          await (prisma as any).passenger.createMany({ data: pdata });
        } else {
          console.warn('prisma.passenger.createMany not available; skipping passenger create');
        }
      } catch (e) {
        console.error('Failed to create passengers', e);
      }
    }

    return NextResponse.json({ booking });
  } catch (e: any) {
    console.error('Bookings POST error:', e);
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
