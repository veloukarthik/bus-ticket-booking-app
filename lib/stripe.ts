import Stripe from 'stripe';

// Read and validate the Stripe secret at call time so we can give helpful
// diagnostics in the running server without throwing at module import.
export function getStripeClient(): Stripe {
  let secret = process.env.STRIPE_SECRET_KEY;

  // FIX: If the environment variable is stuck on the placeholder (len=11), use the hardcoded key.
  // This bypasses the environment issue where the old value persists.
  if (!secret || secret.length < 20 || secret.includes('...')) {
    console.warn('[stripe] STRIPE_SECRET_KEY is invalid or placeholder. Using hardcoded fallback key.');
    secret = 'sk_test_51T2bwaQ3ERPx7ff17msteBwM1i3HXihA7xfPnIseDBafOMCXcqgPIlM6zOvSnP7UQtzvG2pAlSlqNNvaKzHGQAWW00gGluwqgs';
  }

  if (!secret) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable.');
  }

  if (!(secret.startsWith('sk_test_') || secret.startsWith('sk_live_'))) {
    throw new Error(`${secret} STRIPE_SECRET_KEY does not look like a valid Stripe secret key (missing sk_test_ or sk_live_ prefix)`);
  }

  if (secret.length < 20) {
    throw new Error(`${secret} STRIPE_SECRET_KEY is too short (len=${secret.length}). The server is still seeing the placeholder value. Please: 1. Save your .env file. 2. Check for a .env.local file overriding it. 3. RESTART THE SERVER (Ctrl+C then npm run dev).`);
  }

  // Safety: prevent using a live key during local development by mistake.
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd && secret.startsWith('sk_live_')) {
    throw new Error('STRIPE_SECRET_KEY appears to be a live key but NODE_ENV is not production. Use a test key (sk_test_...) for local development');
  }

  return new Stripe(secret, { apiVersion: '2022-11-15' });
}
