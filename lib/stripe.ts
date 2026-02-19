import Stripe from 'stripe';

const secret = process.env.STRIPE_SECRET_KEY;
if (!secret) {
  // don't throw at import time in environments where stripe is not used, but provide a helpful error when used
  // we will throw when trying to get the client
}

export function getStripeClient(): Stripe {
  if (!secret) throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  return new Stripe(secret, { apiVersion: '2022-11-15' });
}
