import { NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bookingId } = body;
    if (!bookingId) return NextResponse.json({ error: 'bookingId required' }, { status: 400 });

    const booking = await prisma.booking.findUnique({ where: { id: Number(bookingId) } });
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    const stripe = getStripeClient();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: { name: `Booking #${booking.id}` },
            unit_amount: Math.round(booking.totalPrice * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment/cancel`,
      metadata: { bookingId: String(booking.id) },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('stripe session error', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
