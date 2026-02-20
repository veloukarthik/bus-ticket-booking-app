import { NextResponse } from 'next/server';

// Safe diagnostic endpoint to show a masked preview of the STRIPE_SECRET_KEY
// the running process sees. This returns only a short, non-secret preview and
// whether NODE_ENV === 'production'. Do NOT use in production.
export async function GET() {
  const secret = process.env.STRIPE_SECRET_KEY;
  console.log('secrret', secret)
  if (!secret) {
    return NextResponse.json({ hasKey: false, masked: null, nodeEnv: process.env.NODE_ENV || null });
  }

  try {
    const trimmed = secret.trim();
    const prefix = trimmed.slice(0, 8);
    const suffix = trimmed.slice(-4);
    const masked = `${prefix}…${suffix}`;
    return NextResponse.json({ hasKey: true, masked, len: trimmed.length, nodeEnv: process.env.NODE_ENV || null });
  } catch (err) {
    return NextResponse.json({ hasKey: true, masked: 'error', nodeEnv: process.env.NODE_ENV || null });
  }
}
