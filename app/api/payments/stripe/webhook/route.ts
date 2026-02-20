import { NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

// Stripe sends a signed payload; we must verify it using the webhook secret
// (set STRIPE_WEBHOOK_SECRET in your .env). This route expects the raw request
// body (text) and the `stripe-signature` header.
export async function POST(req: Request) {
  try {
    const payload = await req.text();
    const sig = req.headers.get('stripe-signature') || '';

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET env var');
      return NextResponse.json({ error: 'Missing STRIPE_WEBHOOK_SECRET' }, { status: 500 });
    }

    const stripe = getStripeClient();

    let event: any;
    try {
      event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
    } catch (err: any) {
      console.error('Stripe webhook signature verification failed:', err?.message || err);
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const bookingId = session?.metadata?.bookingId;

      if (bookingId) {
        try {
          const booking = await prisma.booking.findUnique({
            where: { id: Number(bookingId) },
            include: { trip: true },
          });

          if (booking) {
            await prisma.booking.update({
              where: { id: Number(bookingId) },
              data: {
                isPaid: true,
                paidAt: new Date(),
                paymentStatus: 'paid',
                status: 'CONFIRMED',
                txnId: session.payment_intent ? String(session.payment_intent) : session.id,
                paymentResponse: JSON.stringify({ event: event.type, session }),
                tripDate: booking.trip.departure,
              },
            });
            console.log('Marked booking', bookingId, 'as paid from Stripe webhook');
          }
        } catch (dbErr) {
          console.error('Failed to update booking from webhook:', dbErr);
        }
      } else {
        console.warn('Stripe session completed but no bookingId metadata available');
      }
    }

    // Return a 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('stripe webhook handler error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
