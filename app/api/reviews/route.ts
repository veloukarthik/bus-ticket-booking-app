import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

function getUserIdFromRequest(req: Request): number | null {
  let token: string | null = null;
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }
  if (!token) return null;
  const payload = verifyToken(token) as any;
  const userId = Number(payload?.userId);
  return Number.isNaN(userId) ? null : userId;
}

export async function POST(req: Request) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { bookingId, rating, comment } = await req.json();
    const bookingIdNum = Number(bookingId);
    const ratingNum = Number(rating);

    if (!bookingIdNum || Number.isNaN(bookingIdNum)) {
      return NextResponse.json({ error: "Invalid bookingId" }, { status: 400 });
    }
    if (Number.isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const booking = await prisma.booking.findFirst({
      where: { id: bookingIdNum, userId },
      include: { trip: { include: { vehicle: true } } },
    });
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    const ownerId = booking.trip?.vehicle?.ownerId;
    if (!ownerId) return NextResponse.json({ error: "Owner not found for this booking" }, { status: 400 });
    if (ownerId === userId) return NextResponse.json({ error: "You cannot review your own ride" }, { status: 400 });

    const existing = await prisma.review.findUnique({ where: { bookingId: bookingIdNum } });
    if (existing) return NextResponse.json({ error: "Review already submitted for this booking" }, { status: 409 });

    const review = await prisma.review.create({
      data: {
        bookingId: bookingIdNum,
        customerId: userId,
        ownerId,
        rating: ratingNum,
        comment: comment ? String(comment).trim() : null,
      },
    });

    return NextResponse.json({ review });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
