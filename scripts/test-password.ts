import assert from 'assert';
import { validatePassword } from '../lib/password';

function t(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ ${name}`);
  } catch (e) {
    console.error(`❌ ${name}`);
    console.error(e);
    process.exitCode = 1;
  }
}

t('short password fails length', () => {
  const r = validatePassword('a1b2');
  assert.strictEqual(r.lengthValid, false);
});

t('password with letters and numbers passes alnum', () => {
  const r = validatePassword('pass1234');
  assert.strictEqual(r.alnumValid, true);
  assert.strictEqual(r.lengthValid, true);
});

t('passwords match check', () => {
  const r = validatePassword('pass1234', 'pass1234');
  assert.strictEqual(r.matchValid, true);
});

t('passwords mismatch', () => {
  const r = validatePassword('pass1234', 'pass12345');
  assert.strictEqual(r.matchValid, false);
});

console.log('All password tests complete');
