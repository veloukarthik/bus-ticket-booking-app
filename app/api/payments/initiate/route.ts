import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createChecksum, PAYTM_PROCESS_URL } from '@/lib/paytm';

const DEFAULT_MID = process.env.PAYTM_MID || 'YOUR_MID';
const DEFAULT_WEBSITE = process.env.PAYTM_WEBSITE || 'WEBSTAGING';
const DEFAULT_INDUSTRY = process.env.PAYTM_INDUSTRY || 'Retail';

export async function POST(req: Request) {
  try {
    // validate Paytm environment
    const mid = process.env.PAYTM_MID;
    const merchantKey = process.env.PAYTM_MERCHANT_KEY;
    if (!mid || mid === 'YOUR_MID') {
      return NextResponse.json({ error: 'Server misconfiguration: PAYTM_MID not set. Set PAYTM_MID environment variable.' }, { status: 500 });
    }
    if (!merchantKey) {
      return NextResponse.json({ error: 'Server misconfiguration: PAYTM_MERCHANT_KEY not set. Set PAYTM_MERCHANT_KEY environment variable.' }, { status: 500 });
    }
    const body = await req.json();

    let paytmParams: Record<string, string> = {};

    if (body.bookingId) {
      // booking-based flow
      const { bookingId, amount, customerId } = body;
      const booking = await prisma.booking.findUnique({ where: { id: Number(bookingId) } });
      if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

      const orderId = `ORDER_${bookingId}_${Date.now()}`;
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

      paytmParams = {
        MID: String(DEFAULT_MID),
        WEBSITE: String(DEFAULT_WEBSITE),
        INDUSTRY_TYPE_ID: String(DEFAULT_INDUSTRY),
        CHANNEL_ID: 'WEB',
        ORDER_ID: String(orderId),
        CUST_ID: String(customerId || String(booking.userId)),
        TXN_AMOUNT: String(amount ?? booking.totalPrice),
        CALLBACK_URL: `${baseUrl}/api/payments/callback`,
      };
    } else {
      // generic flow: expect orderId, amount, customerId
      const { orderId, amount, customerId } = body;
      if (!orderId || !amount || !customerId) return NextResponse.json({ error: 'orderId, amount and customerId are required' }, { status: 400 });

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      paytmParams = {
        MID: String(DEFAULT_MID),
        WEBSITE: String(DEFAULT_WEBSITE),
        INDUSTRY_TYPE_ID: String(DEFAULT_INDUSTRY),
        CHANNEL_ID: 'WEB',
        ORDER_ID: String(orderId),
        CUST_ID: String(customerId),
        TXN_AMOUNT: String(amount),
        CALLBACK_URL: `${baseUrl}/api/payments/callback`,
      };
    }

    // generate checksum
    const checksum = await createChecksum(paytmParams);
    paytmParams.CHECKSUMHASH = checksum;

    return NextResponse.json({ params: paytmParams, paytmUrl: PAYTM_PROCESS_URL });
  } catch (err: any) {
    console.error('initiate payment error', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
