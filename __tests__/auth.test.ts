import { describe, it, expect } from 'vitest';
import { signToken, verifyToken } from '../lib/auth';

describe('auth lib', () => {
  it('signs and verifies a token with test secret', () => {
    process.env.JWT_SECRET = 'test-secret';
    const token = signToken({ userId: 'u1', email: 'a@b.com', isAdmin: true } as any);
    expect(typeof token).toBe('string');
    const payload = verifyToken(token as string) as any;
    expect(payload).toBeTruthy();
    expect(payload.email).toBe('a@b.com');
    expect(payload.userId).toBe('u1');
    expect(payload.isAdmin).toBe(true);
  });
});
