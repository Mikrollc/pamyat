import {
  computeOrthodoxPascha,
  getOrthodoxMemorialDates,
  getUSMemorialDates,
  getGraveAnniversaries,
  getUpcomingDates,
} from '../memorial-dates';

describe('computeOrthodoxPascha', () => {
  it('computes 2024 Pascha as May 5', () => {
    const pascha = computeOrthodoxPascha(2024);
    expect(pascha.getFullYear()).toBe(2024);
    expect(pascha.getMonth()).toBe(4); // May
    expect(pascha.getDate()).toBe(5);
  });

  it('computes 2025 Pascha as April 20', () => {
    const pascha = computeOrthodoxPascha(2025);
    expect(pascha.getFullYear()).toBe(2025);
    expect(pascha.getMonth()).toBe(3); // April
    expect(pascha.getDate()).toBe(20);
  });

  it('computes 2026 Pascha as April 12', () => {
    const pascha = computeOrthodoxPascha(2026);
    expect(pascha.getFullYear()).toBe(2026);
    expect(pascha.getMonth()).toBe(3); // April
    expect(pascha.getDate()).toBe(12);
  });
});

describe('getOrthodoxMemorialDates', () => {
  it('returns 7 dates for 2026', () => {
    const dates = getOrthodoxMemorialDates(2026);
    expect(dates).toHaveLength(7);
  });

  it('computes Radonitsa 2026 as April 21', () => {
    const dates = getOrthodoxMemorialDates(2026);
    const radonitsa = dates.find((d) => d.nameKey === 'notifications.radonitsa');
    expect(radonitsa).toBeDefined();
    expect(radonitsa!.date.getMonth()).toBe(3); // April
    expect(radonitsa!.date.getDate()).toBe(21);
  });

  it('computes Universal Parental Saturday 2026 as Feb 14', () => {
    const dates = getOrthodoxMemorialDates(2026);
    const universal = dates.find((d) => d.nameKey === 'notifications.universalParentalSaturday');
    expect(universal!.date.getMonth()).toBe(1); // Feb
    expect(universal!.date.getDate()).toBe(14);
  });

  it('computes Lent Parental Saturdays 2026 as Mar 7, 14, 21', () => {
    const dates = getOrthodoxMemorialDates(2026);
    const lent = dates
      .filter((d) => d.nameKey === 'notifications.lentParentalSaturday')
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    expect(lent).toHaveLength(3);
    expect(lent[0]!.date.getDate()).toBe(7);
    expect(lent[1]!.date.getDate()).toBe(14);
    expect(lent[2]!.date.getDate()).toBe(21);
    expect(lent[0]!.date.getMonth()).toBe(2); // March
  });
});

describe('getUSMemorialDates', () => {
  it('computes Memorial Day 2026 as May 25', () => {
    const dates = getUSMemorialDates(2026);
    expect(dates).toHaveLength(1);
    expect(dates[0]!.date.getMonth()).toBe(4); // May
    expect(dates[0]!.date.getDate()).toBe(25);
  });
});

describe('getGraveAnniversaries', () => {
  it('returns anniversary for grave with full death date', () => {
    const graves = [
      { slug: 'test', person_name: 'Test Person', death_month: 6, death_day: 15 },
    ];
    const result = getGraveAnniversaries(graves, 2026);
    expect(result).toHaveLength(1);
    expect(result[0]!.date.getMonth()).toBe(5); // June
    expect(result[0]!.date.getDate()).toBe(15);
    expect(result[0]!.nameParams).toEqual({ name: 'Test Person' });
  });

  it('skips graves without month or day', () => {
    const graves = [
      { slug: 'a', person_name: 'A', death_month: null, death_day: 15 },
      { slug: 'b', person_name: 'B', death_month: 3, death_day: null },
      { slug: 'c', person_name: 'C', death_month: null, death_day: null },
    ];
    expect(getGraveAnniversaries(graves, 2026)).toHaveLength(0);
  });
});

describe('getUpcomingDates', () => {
  it('filters out past dates', () => {
    const now = new Date(2026, 2, 10); // March 10
    const dates = getUpcomingDates([], true, true, now);
    dates.forEach((d) => {
      expect(d.date.getTime()).toBeGreaterThanOrEqual(now.getTime());
    });
  });

  it('limits to 90 days', () => {
    const now = new Date(2026, 0, 1); // Jan 1
    const dates = getUpcomingDates([], true, true, now);
    const cutoff = new Date(2026, 0, 1 + 90);
    dates.forEach((d) => {
      expect(d.date.getTime()).toBeLessThanOrEqual(cutoff.getTime());
    });
  });

  it('respects pushOrthodox=false', () => {
    const now = new Date(2026, 0, 1);
    const dates = getUpcomingDates([], false, true, now);
    expect(dates.every((d) => d.type !== 'orthodox')).toBe(true);
  });

  it('respects pushUSHolidays=false', () => {
    const now = new Date(2026, 0, 1);
    const dates = getUpcomingDates([], true, false, now);
    expect(dates.every((d) => d.type !== 'us_holiday')).toBe(true);
  });

  it('is sorted chronologically', () => {
    const now = new Date(2026, 0, 1);
    const dates = getUpcomingDates([], true, true, now);
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i]!.date.getTime()).toBeGreaterThanOrEqual(dates[i - 1]!.date.getTime());
    }
  });
});
