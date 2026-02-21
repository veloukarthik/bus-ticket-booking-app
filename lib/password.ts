export function isLengthValid(p: string) {
  return (p || '').trim().length >= 8;
}

export function hasLetter(p: string) {
  return /[A-Za-z]/.test(p || '');
}

export function hasNumber(p: string) {
  return /\d/.test(p || '');
}

export function isAlnumValid(p: string) {
  return hasLetter(p) && hasNumber(p);
}

export function passwordsMatch(p: string, c?: string) {
  return (p || '').trim() === (c || '').trim();
}

export function validatePassword(p: string, c?: string) {
  const lengthValid = isLengthValid(p);
  const alnumValid = isAlnumValid(p);
  const matchValid = c === undefined ? true : passwordsMatch(p, c);
  return { lengthValid, alnumValid, matchValid, hasLetter: hasLetter(p), hasNumber: hasNumber(p) };
}
