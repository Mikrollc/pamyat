/**
 * Format a US phone number as the user types.
 * Input: raw string (may contain non-digits)
 * Output: formatted string like (555) 123-4567
 */
export function formatUSPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/**
 * Strip all non-digit characters from a phone string.
 */
export function stripPhone(raw: string): string {
  return raw.replace(/\D/g, '');
}
