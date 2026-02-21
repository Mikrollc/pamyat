import {
  AsYouType,
  parsePhoneNumberFromString,
  isValidPhoneNumber,
  type CountryCode,
} from 'libphonenumber-js';

export function stripPhone(raw: string): string {
  return raw.replace(/\D/g, '');
}

export function formatPhoneInput(nationalNumber: string, countryCode: CountryCode): string {
  const formatter = new AsYouType(countryCode);
  return formatter.input(nationalNumber);
}

export function formatPhoneDisplay(e164: string): string {
  const normalized = e164.startsWith('+') ? e164 : `+${e164}`;
  const parsed = parsePhoneNumberFromString(normalized);
  if (!parsed) return e164;
  if (parsed.country) {
    const national = new AsYouType(parsed.country).input(parsed.nationalNumber);
    if (national !== parsed.nationalNumber) {
      return `+${parsed.countryCallingCode} ${national}`;
    }
  }
  return parsed.formatInternational();
}

export function toE164(nationalNumber: string, countryCode: CountryCode): string | null {
  const parsed = parsePhoneNumberFromString(nationalNumber, countryCode);
  if (parsed?.isValid()) return parsed.number;
  return null;
}

export function isValidPhone(nationalNumber: string, countryCode: CountryCode): boolean {
  return isValidPhoneNumber(nationalNumber, countryCode);
}
