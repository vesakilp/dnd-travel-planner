/**
 * Harptos calendar utilities for the Forgotten Realms (Dale Reckoning).
 *
 * The Harptos calendar has 12 months of 30 days each, plus 5 festival days
 * (and a 6th, Shieldmeet, every 4 years), totalling 365 (or 366) days per year.
 *
 * Internal date format: "DR:{year}:{dayOfYear}" — e.g. "DR:1491:175"
 */

export interface HarptosSegment {
  /** Display name of the month or festival. */
  name: string;
  /** Common nickname if applicable. */
  nickname: string;
  /** Whether this segment is a single-day festival (no day picker needed). */
  isFestival: boolean;
  /** The 1-based day-of-year on which this segment *starts* in a non-leap year. */
  startDayNonLeap: number;
}

/** All 17 calendar segments in order (non-leap layout). */
export const HARPTOS_SEGMENTS: HarptosSegment[] = [
  { name: "Hammer",           nickname: "Deepwinter",          isFestival: false, startDayNonLeap: 1   },
  { name: "Midwinter",        nickname: "High Festival",        isFestival: true,  startDayNonLeap: 31  },
  { name: "Alturiak",         nickname: "The Claw of Winter",   isFestival: false, startDayNonLeap: 32  },
  { name: "Ches",             nickname: "The Claw of Sunsets",  isFestival: false, startDayNonLeap: 62  },
  { name: "Tarsakh",          nickname: "The Claw of Storms",   isFestival: false, startDayNonLeap: 92  },
  { name: "Greengrass",       nickname: "High Festival",        isFestival: true,  startDayNonLeap: 122 },
  { name: "Mirtul",           nickname: "The Melting",          isFestival: false, startDayNonLeap: 123 },
  { name: "Kythorn",          nickname: "The Time of Flowers",  isFestival: false, startDayNonLeap: 153 },
  { name: "Flamerule",        nickname: "Summertide",           isFestival: false, startDayNonLeap: 183 },
  { name: "Midsummer",        nickname: "High Festival",        isFestival: true,  startDayNonLeap: 213 },
  { name: "Shieldmeet",       nickname: "Leap Day",             isFestival: true,  startDayNonLeap: 214 }, // leap years only
  { name: "Eleasis",          nickname: "Highsun",              isFestival: false, startDayNonLeap: 214 },
  { name: "Eleint",           nickname: "The Fading",           isFestival: false, startDayNonLeap: 244 },
  { name: "Highharvestide",   nickname: "High Festival",        isFestival: true,  startDayNonLeap: 274 },
  { name: "Marpenoth",        nickname: "Leaffall",             isFestival: false, startDayNonLeap: 275 },
  { name: "Uktar",            nickname: "The Rotting",          isFestival: false, startDayNonLeap: 305 },
  { name: "Feast of the Moon",nickname: "High Festival",        isFestival: true,  startDayNonLeap: 335 },
  { name: "Nightal",          nickname: "The Drawing Down",     isFestival: false, startDayNonLeap: 336 },
];

/** Returns true if the given DR year is a leap year (Shieldmeet is observed). */
export function isLeapYear(year: number): boolean {
  return year % 4 === 0;
}

/** Total days in the given DR year (365 or 366). */
export function daysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

/**
 * Return segments visible for the given year (Shieldmeet only visible in leap years).
 * Each segment's `startDay` is adjusted for leap year.
 */
export function segmentsForYear(year: number): Array<HarptosSegment & { startDay: number; endDay: number }> {
  const leap = isLeapYear(year);
  return HARPTOS_SEGMENTS.filter((s) => {
    if (s.name === "Shieldmeet") return leap;
    return true;
  }).map((s) => {
    // After Midsummer (day 213), shift by 1 if leap (Shieldmeet takes day 214)
    let startDay = s.startDayNonLeap;
    if (leap && s.name !== "Shieldmeet" && startDay >= 214) {
      startDay += 1;
    }
    const endDay = s.isFestival ? startDay : startDay + 29;
    return { ...s, startDay, endDay };
  });
}

/**
 * Convert a day-of-year (1-based) in the given DR year to a display string.
 * e.g. 175 in 1491 → "23 Kythorn 1491 DR"
 */
export function harptosDateToString(year: number, dayOfYear: number): string {
  const segs = segmentsForYear(year);
  for (const seg of segs) {
    if (dayOfYear >= seg.startDay && dayOfYear <= seg.endDay) {
      if (seg.isFestival) return `${seg.name} ${year} DR`;
      const dayInMonth = dayOfYear - seg.startDay + 1;
      return `${dayInMonth} ${seg.name} ${year} DR`;
    }
  }
  return `Day ${dayOfYear} of ${year} DR`;
}

/**
 * Parse an internal DR date string "DR:{year}:{dayOfYear}" into its components.
 * Returns null if the string is empty, undefined, or malformed.
 */
export function parseDrString(s: string | undefined): { year: number; dayOfYear: number } | null {
  if (!s) return null;
  const m = s.match(/^DR:(\d+):(\d+)$/);
  if (!m) return null;
  return { year: Number(m[1]), dayOfYear: Number(m[2]) };
}

/** Build an internal DR date string. */
export function toDrString(year: number, dayOfYear: number): string {
  return `DR:${year}:${dayOfYear}`;
}

/**
 * Add `days` to a DR date, returning the new year and dayOfYear
 * (handles year rollover correctly).
 */
export function addDrDays(
  year: number,
  dayOfYear: number,
  days: number
): { year: number; dayOfYear: number } {
  let y = year;
  let d = dayOfYear + days;
  while (d > daysInYear(y)) {
    d -= daysInYear(y);
    y += 1;
  }
  while (d < 1) {
    y -= 1;
    d += daysInYear(y);
  }
  return { year: y, dayOfYear: d };
}

/**
 * Get the segment index and day-within-segment for a given day-of-year.
 * Used by the date picker to initialise its selectors.
 */
export function dayOfYearToSegmentDay(
  year: number,
  dayOfYear: number
): { segmentIndex: number; dayInSegment: number } {
  const segs = segmentsForYear(year);
  for (let i = 0; i < segs.length; i++) {
    if (dayOfYear >= segs[i].startDay && dayOfYear <= segs[i].endDay) {
      return { segmentIndex: i, dayInSegment: dayOfYear - segs[i].startDay + 1 };
    }
  }
  return { segmentIndex: 0, dayInSegment: 1 };
}

/**
 * Convert a segment index + day within segment to a day-of-year.
 * For festival segments dayInSegment is ignored (always 1).
 */
export function segmentDayToDayOfYear(
  year: number,
  segmentIndex: number,
  dayInSegment: number
): number {
  const segs = segmentsForYear(year);
  const seg = segs[segmentIndex];
  if (!seg) return 1;
  if (seg.isFestival) return seg.startDay;
  const clamped = Math.max(1, Math.min(30, dayInSegment));
  return seg.startDay + clamped - 1;
}

/** Default journey start: 23 Kythorn 1491 DR */
export const DEFAULT_DR_DATE = "DR:1491:175";
