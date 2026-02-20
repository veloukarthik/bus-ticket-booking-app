import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createChecksum, PAYTM_STATUS_URL } from '@/lib/paytm';

const MERCHANT_KEY = 'O1SjmMX3iWi%4R%N';

export async function POST(req: Request) {
  try {
    const contentType = (req.headers.get && req.headers.get('content-type')) || '';
    // Read raw text once (avoids double-consuming the body). We'll try parsing from this.
    const rawText = await req.text();
    let data: any = {};

    // Helpful debug info for local dev: log content-type and raw body when checksum missing
    try {
      console.debug('paytm callback content-type:', contentType);
      console.debug('paytm callback raw body:', rawText);
    } catch (_) {}

    const content = contentType.toLowerCase();
    if (content.includes('application/json')) {
      try { data = rawText ? JSON.parse(rawText) : {}; } catch (e) { data = {}; }
    } else if (content.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams(rawText || '');
      for (const [k, v] of params) data[k] = v;
    } else if (content.includes('multipart/form-data')) {
      // multipart parsing is expensive; try formData as best-effort
      try {
        const form = await req.formData();
        for (const [k, v] of form.entries()) data[k] = String(v);
      } catch (e) {
        // fallback: try urlencoded/JSON from raw text
        const params = new URLSearchParams(rawText || '');
        if ([...params].length > 0) {
          for (const [k, v] of params) data[k] = v;
        } else {
          try { data = rawText ? JSON.parse(rawText) : {}; } catch (err) { data = {}; }
        }
      }
    } else {
      // unknown content-type: try urlencoded first, then JSON
      const params = new URLSearchParams(rawText || '');
      if ([...params].length > 0) {
        for (const [k, v] of params) data[k] = v;
      } else {
        try { data = rawText ? JSON.parse(rawText) : {}; } catch (err) { data = {}; }
      }
    }

    try { console.debug('paytm callback parsed keys:', Object.keys(data)); } catch (_) {}

    const checksum = data.CHECKSUMHASH || data.CHECKSUM || data.checksumhash || data.checksum || data.ChecksumHash || data.Checksum || data.CHECKSUM_HASH;
    if (!checksum) {
      // If checksum is missing from Paytm's posted payload (some failure redirects omit it),
      // perform a server-to-server transaction status check as a fallback.
      try {
        const orderId = data.ORDERID || data.ORDER_ID || data.ORDERID;
        if (!orderId) throw new Error('ORDERID missing; cannot perform status check');

        // Build status request body and signature
        const statusBody = { mid: process.env.PAYTM_MID || '', orderId };
        const signature = await createChecksum(JSON.stringify(statusBody));

        const statusRes = await fetch(PAYTM_STATUS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body: statusBody, head: { signature } }),
        });

        const statusJson = await statusRes.json().catch(() => null);
        // If Paytm returned a status JSON, use it as authoritative for transaction result
        if (statusJson && statusJson.body) {
          const resp = statusJson.body;
          // map fields back into data so downstream logic can proceed
          data.STATUS = resp.resultInfo?.resultStatus || resp.STATUS || data.STATUS;
          data.RESPMSG = resp.resultInfo?.resultMsg || resp.RESPMSG || data.RESPMSG;
          data.RESPCODE = resp.resultInfo?.resultCode || resp.RESPCODE || data.RESPCODE;
          data.TXNID = resp.txnId || data.TXNID;
          // continue without checksum (we've validated server-side)
        } else {
          const debugInfo: any = { error: 'Missing CHECKSUMHASH in callback payload' };
          if (process.env.NODE_ENV !== 'production') {
            debugInfo.contentType = contentType;
            debugInfo.rawBody = rawText;
            debugInfo.parsedKeys = Object.keys(data);
            debugInfo.statusApiResponse = statusJson || await statusRes.text().catch(() => null);
          }
          return NextResponse.json(debugInfo, { status: 400 });
        }
      } catch (e: any) {
        const debugInfo: any = { error: 'Missing CHECKSUMHASH in callback payload' };
        if (process.env.NODE_ENV !== 'production') {
          debugInfo.contentType = contentType;
          debugInfo.rawBody = rawText;
          debugInfo.parsedKeys = Object.keys(data);
          debugInfo.statusError = String(e?.message || e);
        }
        return NextResponse.json(debugInfo, { status: 400 });
      }
    }
    delete data.CHECKSUMHASH; delete data.CHECKSUM; delete data.checksumhash;

    // dynamic import to avoid CJS/Esm mismatch
    const mod = await import('paytmchecksum').catch((e) => {
      console.error('paytmchecksum import error', e);
      throw e;
    });
    const PaytmChecksum: any = mod?.verifySignature ? mod : mod?.default ? mod.default : mod;
    if (!PaytmChecksum || !PaytmChecksum.verifySignature) {
      throw new Error('paytmchecksum module not available');
    }

    // ensure all values are strings
    const verifyData: Record<string, string> = {};
    for (const k of Object.keys(data)) verifyData[k] = String(data[k]);

    let isValid = false;
    try {
      isValid = PaytmChecksum.verifySignature(verifyData, MERCHANT_KEY, checksum);
    } catch (e: any) {
      console.error('verifySignature error', e);
      return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
    }
    if (!isValid) return NextResponse.json({ error: 'Invalid checksum' }, { status: 400 });

    const orderId = data.ORDERID || data.ORDER_ID || data.ORDERID;
    const match = orderId ? orderId.split('_')[1] : null;
    if (match) {
      const bookingId = Number(match);
      try {
        // extract common Paytm response fields (try multiple key variants)
        const txnId = data.TXNID || data.TXN_ID || verifyData.TXNID || verifyData.TXN_ID || null;
        const status = data.STATUS || verifyData.STATUS || null;
        const respMsg = data.RESPMSG || data.RESP_MSG || verifyData.RESPMSG || verifyData.RESP_MSG || null;
        const respCode = data.RESPCODE || data.RESP_CODE || verifyData.RESPCODE || verifyData.RESP_CODE || null;

        const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: { trip: true },
        });

        if (booking) {
          await prisma.booking.update({
            where: { id: bookingId },
            data: {
              isPaid: true,
              paidAt: new Date(),
              status: 'CONFIRMED',
              paymentResponse: JSON.stringify(verifyData),
              txnId: txnId ?? undefined,
              paymentStatus: status ?? undefined,
              respCode: respCode ?? undefined,
              respMsg: respMsg ?? undefined,
              tripDate: booking.trip.departure,
            },
          });
        }
      } catch (e: unknown) {
        console.error('failed to update booking payment status', e);
      }
    }

    return NextResponse.redirect(new URL('/payment/success', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
  } catch (err: any) {
    console.error('paytm callback error', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
