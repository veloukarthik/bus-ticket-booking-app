import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getStripeClient } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export default async function PaymentSuccessPage(props: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const searchParams = await props.searchParams;
  const session_id = searchParams?.session_id;

  // If no session_id is present, we assume it's a direct visit.
  if (!session_id) {
    redirect('/bookings');
  }

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      const bookingId = session.metadata?.bookingId;
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
              txnId: typeof session.payment_intent === 'string' ? session.payment_intent : session.id,
              paymentResponse: JSON.stringify(session),
              tripDate: booking.trip.departure,
            },
          });
          // Ensure the bookings page shows the updated status immediately
          revalidatePath('/bookings');
          console.log(`✅ Payment success: Booking ${bookingId} updated to CONFIRMED`);
        }
        } catch (err) {
          console.error('❌ Database update failed in success page:', err);
        }
      } else {
        console.warn('⚠️ Payment success but NO bookingId found in session metadata');
      }
    }
  } catch (error) {
    console.error('Error verifying payment session:', error);
  }

  // Redirect to the bookings list
  redirect('/bookings');
}