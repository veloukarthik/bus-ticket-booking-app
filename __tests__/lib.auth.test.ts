import { describe, it, expect } from 'vitest';
import {
  getTokenFromAuthHeader,
  requireAdminFromToken,
  signToken,
  verifyToken,
} from '../lib/auth';

describe('auth utils', () => {
  it('signs and verifies token payload', () => {
    const token = signToken({ userId: 1, email: 'admin@site.com', isAdmin: true });
    const payload = verifyToken(token) as any;

    expect(payload).toBeTruthy();
    expect(payload.userId).toBe(1);
    expect(payload.email).toBe('admin@site.com');
    expect(payload.isAdmin).toBe(true);
  });

  it('returns null for invalid token', () => {
    expect(verifyToken('not.a.valid.jwt')).toBeNull();
  });

  it('requires admin in token payload', () => {
    const adminToken = signToken({ userId: 1, isAdmin: true });
    const userToken = signToken({ userId: 2, isAdmin: false });

    expect(requireAdminFromToken(adminToken)).toBeTruthy();
    expect(requireAdminFromToken(userToken)).toBeNull();
    expect(requireAdminFromToken(undefined)).toBeNull();
  });

  it('extracts bearer token from Headers instance and plain object', () => {
    const token = 'abc.def.ghi';

    const headers = new Headers({ Authorization: `Bearer ${token}` });
    expect(getTokenFromAuthHeader(headers)).toBe(token);

    expect(getTokenFromAuthHeader({ authorization: `Bearer ${token}` })).toBe(token);
    expect(getTokenFromAuthHeader(undefined)).toBeNull();
  });
});
