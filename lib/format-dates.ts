/**
 * Format a single grave date from separate y/m/d fields.
 * Returns "DD.MM.YYYY", "MM.YYYY", "YYYY", or "?" based on available data.
 */
export function formatGraveDate(
  year: number | null | undefined,
  month: number | null | undefined,
  day: number | null | undefined,
): string {
  if (!year) return '?';
  if (!month) return `${year}`;
  const mm = String(month).padStart(2, '0');
  if (!day) return `${mm}.${year}`;
  const dd = String(day).padStart(2, '0');
  return `${dd}.${mm}.${year}`;
}

/**
 * Format birth-death date range. Returns "birth — death" string.
 */
export function formatGraveDateRange(
  birthYear: number | null | undefined,
  birthMonth: number | null | undefined,
  birthDay: number | null | undefined,
  deathYear: number | null | undefined,
  deathMonth: number | null | undefined,
  deathDay: number | null | undefined,
): string {
  const birth = formatGraveDate(birthYear, birthMonth, birthDay);
  const death = formatGraveDate(deathYear, deathMonth, deathDay);
  return `${birth} — ${death}`;
}
