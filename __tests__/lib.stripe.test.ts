import { beforeEach, describe, expect, it, vi } from 'vitest';

const stripeCtor = vi.fn((secret: string, options: any) => ({ secret, options }));

vi.mock('stripe', () => ({
  default: stripeCtor,
}));

describe('stripe client factory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.STRIPE_SECRET_KEY;
    process.env.NODE_ENV = 'test';
  });

  it('uses configured test key', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_12345678901234567890';
    const { getStripeClient } = await import('../lib/stripe');

    const client: any = getStripeClient();
    expect(client.secret).toBe('sk_test_12345678901234567890');
    expect(stripeCtor).toHaveBeenCalledTimes(1);
  });

  it('falls back to hardcoded key for invalid placeholder', async () => {
    process.env.STRIPE_SECRET_KEY = '...';
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { getStripeClient } = await import('../lib/stripe');

    const client: any = getStripeClient();
    expect(client.secret.startsWith('sk_test_')).toBe(true);
    expect(warn).toHaveBeenCalled();

    warn.mockRestore();
  });

  it('rejects live key outside production', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_live_12345678901234567890';
    const { getStripeClient } = await import('../lib/stripe');

    expect(() => getStripeClient()).toThrow(/live key/);
  });
});
