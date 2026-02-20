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

/**
 * Format an E.164 phone number for display.
 * Input: "+15551234567" or "15551234567"
 * Output: "+1 (555) 123-4567"
 */
export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  // US number with country code (11 digits starting with 1)
  if (digits.length === 11 && digits.startsWith('1')) {
    const local = digits.slice(1);
    return `+1 (${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`;
  }
  // Already 10 digits (no country code)
  if (digits.length === 10) {
    return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  // Fallback: return as-is
  return phone;
}
