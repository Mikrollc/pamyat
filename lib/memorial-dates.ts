export interface MemorialDate {
  id: string;
  nameKey: string;
  nameParams?: Record<string, string>;
  date: Date;
  type: 'orthodox' | 'us_holiday' | 'anniversary';
  graveSlug?: string;
}

/**
 * Compute Orthodox Pascha (Easter) for a given year.
 * Uses the standard Julian calendar computus, then converts to Gregorian (+13 days for 21st century).
 */
export function computeOrthodoxPascha(year: number): Date {
  const a = year % 19;
  const b = year % 4;
  const c = year % 7;
  const d = (19 * a + 15) % 30;
  const e = (2 * b + 4 * c + 6 * d + 6) % 7;

  let julianMonth: number;
  let julianDay: number;

  if (d + e > 10) {
    julianMonth = 3; // April (0-indexed)
    julianDay = d + e - 9;
  } else {
    julianMonth = 2; // March (0-indexed)
    julianDay = 22 + d + e;
  }

  // Julian → Gregorian: +13 days for 21st century
  const date = new Date(year, julianMonth, julianDay);
  date.setDate(date.getDate() + 13);
  return date;
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

export function getOrthodoxMemorialDates(year: number): MemorialDate[] {
  const pascha = computeOrthodoxPascha(year);
  const dates: MemorialDate[] = [];

  // Universal Parental Saturday (Мясопустная) — 57 days before Pascha
  dates.push({
    id: `orthodox-universal-${year}`,
    nameKey: 'notifications.universalParentalSaturday',
    date: addDays(pascha, -57),
    type: 'orthodox',
  });

  // 2nd, 3rd, 4th Saturdays of Great Lent
  for (const [offset, idx] of [[-36, 2], [-29, 3], [-22, 4]] as const) {
    dates.push({
      id: `orthodox-lent-${idx}-${year}`,
      nameKey: 'notifications.lentParentalSaturday',
      date: addDays(pascha, offset),
      type: 'orthodox',
    });
  }

  // Radonitsa — 9 days after Pascha
  dates.push({
    id: `orthodox-radonitsa-${year}`,
    nameKey: 'notifications.radonitsa',
    date: addDays(pascha, 9),
    type: 'orthodox',
  });

  // Trinity Saturday — 48 days after Pascha (Saturday before Pentecost)
  dates.push({
    id: `orthodox-trinity-${year}`,
    nameKey: 'notifications.trinitySaturday',
    date: addDays(pascha, 48),
    type: 'orthodox',
  });

  // Dmitrievskaya Saturday — Saturday on or before November 8
  const nov8 = new Date(year, 10, 8);
  const dow = nov8.getDay();
  const distance = (dow - 6 + 7) % 7; // days back to Saturday
  dates.push({
    id: `orthodox-dmitrievskaya-${year}`,
    nameKey: 'notifications.dmitrievskaya',
    date: new Date(year, 10, 8 - distance),
    type: 'orthodox',
  });

  return dates;
}

export function getUSMemorialDates(year: number): MemorialDate[] {
  // Memorial Day: last Monday of May
  const may31 = new Date(year, 4, 31);
  const dow = may31.getDay();
  const distance = (dow - 1 + 7) % 7; // days back to Monday
  return [
    {
      id: `us-memorial-day-${year}`,
      nameKey: 'notifications.memorialDay',
      date: new Date(year, 4, 31 - distance),
      type: 'us_holiday',
    },
  ];
}

interface GraveForAnniversary {
  slug: string;
  person_name: string;
  death_month: number | null;
  death_day: number | null;
}

export function getGraveAnniversaries(
  graves: GraveForAnniversary[],
  year: number,
): MemorialDate[] {
  return graves
    .filter((g) => g.death_month != null && g.death_day != null)
    .map((g) => ({
      id: `anniversary-${g.slug}-${year}`,
      nameKey: 'notifications.deathAnniversary',
      nameParams: { name: g.person_name },
      date: new Date(year, g.death_month! - 1, g.death_day!),
      type: 'anniversary' as const,
      graveSlug: g.slug,
    }));
}

export function getUpcomingDates(
  graves: GraveForAnniversary[],
  pushOrthodox: boolean,
  pushUSHolidays: boolean,
  now: Date = new Date(),
): MemorialDate[] {
  const year = now.getFullYear();
  const today = new Date(year, now.getMonth(), now.getDate());

  let dates: MemorialDate[] = [];

  if (pushOrthodox) {
    dates.push(...getOrthodoxMemorialDates(year));
    dates.push(...getOrthodoxMemorialDates(year + 1));
  }

  if (pushUSHolidays) {
    dates.push(...getUSMemorialDates(year));
    dates.push(...getUSMemorialDates(year + 1));
  }

  dates.push(...getGraveAnniversaries(graves, year));
  dates.push(...getGraveAnniversaries(graves, year + 1));

  // Future dates only (including today)
  dates = dates.filter((d) => d.date >= today);

  // Sort chronologically
  dates.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Limit to next 90 days
  const cutoff = addDays(today, 90);
  dates = dates.filter((d) => d.date <= cutoff);

  return dates;
}
