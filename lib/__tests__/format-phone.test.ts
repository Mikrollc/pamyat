import {
  stripPhone,
  formatPhoneInput,
  formatPhoneDisplay,
  toE164,
  isValidPhone,
} from '../format-phone';

describe('stripPhone', () => {
  it('removes non-digit characters', () => {
    expect(stripPhone('+1 (212) 555-1234')).toBe('12125551234');
  });

  it('leaves a digit-only string unchanged', () => {
    expect(stripPhone('12125551234')).toBe('12125551234');
  });

  it('returns empty string for empty input', () => {
    expect(stripPhone('')).toBe('');
  });
});

describe('formatPhoneInput', () => {
  it('formats a US number as the user types', () => {
    expect(formatPhoneInput('2125551234', 'US')).toBe('(212) 555-1234');
  });

  it('formats a partial US number', () => {
    expect(formatPhoneInput('212', 'US')).toBe('(212)');
  });

  it('returns unformatted digits for BY (no AsYouType rules in libphonenumber)', () => {
    expect(formatPhoneInput('291234567', 'BY')).toBe('291234567');
  });

  it('formats a Russian number', () => {
    expect(formatPhoneInput('9161234567', 'RU')).toBe('916 123-45-67');
  });
});

describe('formatPhoneDisplay', () => {
  it('formats US E.164 with + prefix', () => {
    expect(formatPhoneDisplay('+12125551234')).toBe('+1 (212) 555-1234');
  });

  // regression: Supabase sometimes omits the leading +
  it('formats US E.164 without + prefix', () => {
    expect(formatPhoneDisplay('12125551234')).toBe('+1 (212) 555-1234');
  });

  it('formats a Belarus number via formatInternational fallback', () => {
    expect(formatPhoneDisplay('+375291234567')).toBe('+375 29 123 45 67');
  });

  it('formats a Russian number via AsYouType (consistent with input)', () => {
    expect(formatPhoneDisplay('+79161234567')).toBe('+7 916 123-45-67');
  });

  it('returns input as-is for unparseable string', () => {
    expect(formatPhoneDisplay('not-a-phone')).toBe('not-a-phone');
  });

  it('returns empty string for empty input', () => {
    expect(formatPhoneDisplay('')).toBe('');
  });
});

describe('toE164', () => {
  it('converts a valid US national number to E.164', () => {
    expect(toE164('2125551234', 'US')).toBe('+12125551234');
  });

  it('returns null for an invalid number', () => {
    expect(toE164('000', 'US')).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(toE164('', 'US')).toBeNull();
  });
});

describe('isValidPhone', () => {
  it('returns true for a valid US national number', () => {
    expect(isValidPhone('2125551234', 'US')).toBe(true);
  });

  it('returns true for a valid US number with + prefix', () => {
    expect(isValidPhone('+12125551234', 'US')).toBe(true);
  });

  it('returns false for an invalid US number', () => {
    expect(isValidPhone('123', 'US')).toBe(false);
  });

  it('returns true for a valid Belarus number', () => {
    expect(isValidPhone('+375291234567', 'BY')).toBe(true);
  });

  it('returns false for empty input', () => {
    expect(isValidPhone('', 'US')).toBe(false);
  });
});
