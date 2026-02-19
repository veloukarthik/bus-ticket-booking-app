// Lightweight Paytm helper: generate checksum and paytm url
const MERCHANT_KEY = process.env.PAYTM_MERCHANT_KEY;
if (!MERCHANT_KEY) {
  // Do not default to a hard-coded key in application code. Fail fast so devs set env vars.
  // Throwing here prevents the server from silently using an invalid key.
  // In serverless environments this file may be imported at runtime; handle gracefully.
}

export const PAYTM_PROCESS_URL = (process.env.NEXT_PUBLIC_PAYTM_ENV || 'STAGING').toUpperCase() === 'PROD'
  ? 'https://securegw.paytm.in/order/process'
  : 'https://securegw-stage.paytm.in/order/process';

export const PAYTM_STATUS_URL = (process.env.NEXT_PUBLIC_PAYTM_ENV || 'STAGING').toUpperCase() === 'PROD'
  ? 'https://securegw.paytm.in/order/status'
  : 'https://securegw-stage.paytm.in/order/status';

export async function createChecksum(params: Record<string, string | number | boolean> | string): Promise<string> {
  // Dynamic import to avoid CJS/ESM issues
  const mod = await import('paytmchecksum').catch((e) => {
    console.error('Failed to import paytmchecksum', e);
    throw e;
  });
  const PaytmChecksum: any = mod?.default ?? mod;
  if (!PaytmChecksum || typeof PaytmChecksum.generateSignature !== 'function') {
    throw new Error('paytmchecksum.generateSignature not available');
  }

  if (!MERCHANT_KEY) throw new Error('Missing PAYTM_MERCHANT_KEY environment variable');

  // If params is an object, ensure all values are strings (library expects strings)
  const payload: any = typeof params === 'string' ? params : {};
  if (typeof params !== 'string') {
    for (const k of Object.keys(params)) payload[k] = String((params as any)[k]);
  }

  // generateSignature accepts object or string depending on flow
  const signature = await PaytmChecksum.generateSignature(payload, MERCHANT_KEY);
  return signature;
}
