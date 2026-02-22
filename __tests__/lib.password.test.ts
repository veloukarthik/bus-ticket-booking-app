import { describe, it, expect } from 'vitest';
import {
  hasLetter,
  hasNumber,
  isAlnumValid,
  isLengthValid,
  passwordsMatch,
  validatePassword,
} from '../lib/password';

describe('password utils', () => {
  it('validates minimum length', () => {
    expect(isLengthValid(' abc12345 ')).toBe(true);
    expect(isLengthValid('abc123')).toBe(false);
    expect(isLengthValid('')).toBe(false);
  });

  it('checks letters and numbers', () => {
    expect(hasLetter('123')).toBe(false);
    expect(hasLetter('a1')).toBe(true);
    expect(hasNumber('abc')).toBe(false);
    expect(hasNumber('abc1')).toBe(true);
    expect(isAlnumValid('abc1')).toBe(true);
    expect(isAlnumValid('abcdef')).toBe(false);
  });

  it('matches passwords after trimming', () => {
    expect(passwordsMatch(' pass1234 ', 'pass1234')).toBe(true);
    expect(passwordsMatch('pass1234', 'pass12345')).toBe(false);
  });

  it('returns full validation object', () => {
    expect(validatePassword('pass1234', 'pass1234')).toEqual({
      lengthValid: true,
      alnumValid: true,
      matchValid: true,
      hasLetter: true,
      hasNumber: true,
    });

    expect(validatePassword('short', 'mismatch')).toEqual({
      lengthValid: false,
      alnumValid: false,
      matchValid: false,
      hasLetter: true,
      hasNumber: false,
    });
  });
});
