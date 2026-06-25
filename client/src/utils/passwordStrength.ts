export function calculatePasswordScore(password: string): number {
  if (!password) return 0;
  const lengthScore = password.length;
  const hasLower = /[a-z]/.test(password) ? 2 : 0;
  const hasUpper = /[A-Z]/.test(password) ? 2 : 0;
  const hasDigit = /[0-9]/.test(password) ? 2 : 0;
  const hasSymbol = /[^A-Za-z0-9]/.test(password) ? 2 : 0;
  return lengthScore + hasLower + hasUpper + hasDigit + hasSymbol;
}
