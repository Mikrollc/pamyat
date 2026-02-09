const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1800;

function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

export function validatePartialDate(
  year: number | null,
  month: number | null,
  day: number | null,
): string | null {
  if (year != null) {
    if (year < MIN_YEAR || year > CURRENT_YEAR) {
      return 'invalidYear';
    }
  }

  if (month != null) {
    if (month < 1 || month > 12) {
      return 'invalidMonth';
    }
  }

  if (day != null && month != null && year != null) {
    const maxDay = daysInMonth(month, year);
    if (day < 1 || day > maxDay) {
      return 'invalidDay';
    }
  } else if (day != null) {
    if (day < 1 || day > 31) {
      return 'invalidDay';
    }
  }

  return null;
}

export function validateDateOrder(
  birthYear: number | null,
  deathYear: number | null,
  birthMonth: number | null,
  deathMonth: number | null,
  birthDay: number | null,
  deathDay: number | null,
): boolean {
  if (birthYear == null || deathYear == null) return true;
  if (birthYear > deathYear) return false;
  if (birthYear < deathYear) return true;

  // Same year — check month
  if (birthMonth == null || deathMonth == null) return true;
  if (birthMonth > deathMonth) return false;
  if (birthMonth < deathMonth) return true;

  // Same month — check day
  if (birthDay == null || deathDay == null) return true;
  return birthDay <= deathDay;
}
