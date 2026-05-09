import { TimeOfDay } from "./types";
import { parseDrString, addDrDays, harptosDateToString, toDrString } from "./harptos";

/**
 * Hours already elapsed in the 8-hour travel window when departing at a given time of day.
 * 0 = morning (full day ahead), 4 = afternoon (half day ahead),
 * 8 = evening/night (no travel today — camp and resume next morning).
 */
const DEPARTURE_OFFSET_HOURS: Record<TimeOfDay, number> = {
  morning: 0,
  afternoon: 4,
  evening: 8,
  night: 8,
};

/** Convert a TimeOfDay value to the number of hours already elapsed in the travel window. */
export function timeOfDayToSlotHour(tod: TimeOfDay): number {
  return DEPARTURE_OFFSET_HOURS[tod];
}

/**
 * Given a stage departure (dayIndex from journey start, slotHour into travel window)
 * and the total travel hours needed, compute the arrival.
 *
 * Characters travel 8 hours per day (morning = 0h, evening = 8h).
 * Camping rule: when the travel window ends (slotHour >= 8) they camp overnight
 * and resume at morning (slotHour = 0) of the next day.
 *
 * @param startDayIndex  0-based calendar day from journey start
 * @param startSlotHour  hours already elapsed in the travel window on the departure day
 * @param travelHoursNeeded  total hours of movement required
 */
export function computeArrival(
  startDayIndex: number,
  startSlotHour: number,
  travelHoursNeeded: number
): { dayIndex: number; slotHour: number } {
  const normalizedStart = normalizeDeparture(startDayIndex, startSlotHour);
  const dayIdx = normalizedStart.dayIndex;
  const slotHour = normalizedStart.slotHour;

  const availableToday = 8 - slotHour;

  if (travelHoursNeeded <= availableToday) {
    // Arrive within the same travel day
    return { dayIndex: dayIdx, slotHour: slotHour + travelHoursNeeded };
  }

  // Use up today's travel window, camp, and continue next days
  const remaining = travelHoursNeeded - availableToday;
  const additionalDays = Math.ceil(remaining / 8);
  // When remaining is an exact multiple of 8 the party fills the last day completely,
  // arriving at evening (slotHour 8). Otherwise they arrive mid-day.
  const finalSlotHour = remaining % 8 === 0 ? 8 : remaining % 8;
  return { dayIndex: dayIdx + additionalDays, slotHour: finalSlotHour };
}

/**
 * Given the arrival slot hour (hours into the travel window), return a human-readable
 * time-of-day label.
 */
export function slotHourToLabel(h: number): string {
  if (h < 4) return "Morning";
  if (h < 8) return "Afternoon";
  return "Evening";
}

/** Normalize a departure to the next valid travel slot if needed. */
export function normalizeDeparture(
  dayIndex: number,
  slotHour: number
): { dayIndex: number; slotHour: number } {
  if (slotHour >= 8) return { dayIndex: dayIndex + 1, slotHour: 0 };
  return { dayIndex, slotHour };
}

/**
 * Compute the departure for the next stage given the arrival of the current one and
 * the next stage's declared startTimeOfDay.
 *
 * - If arrived at Evening: camp overnight, depart next Morning (ignore declared time).
 * - If arrived earlier and declared time >= arrival: depart same day at declared time.
 * - If arrived earlier but declared time < arrival: camp overnight, depart next day at declared time.
 */
export function nextStageDeparture(
  arrivalDayIndex: number,
  arrivalSlotHour: number
): { dayIndex: number; slotHour: number } {
  return normalizeDeparture(arrivalDayIndex, arrivalSlotHour);
}

/**
 * Format an arrival date for display using the Harptos (Dale Reckoning) calendar.
 * If journeyStartDate is provided as "DR:{year}:{dayOfYear}", returns a formatted
 * Harptos date string. Otherwise returns "Day N" (1-based).
 */
export function formatArrivalDate(
  journeyStartDate: string | undefined,
  dayIndex: number
): string {
  const parsed = parseDrString(journeyStartDate);
  if (!parsed) return `Day ${dayIndex + 1}`;
  const { year, dayOfYear } = addDrDays(parsed.year, parsed.dayOfYear, dayIndex);
  return harptosDateToString(year, dayOfYear);
}

/**
 * Return the raw internal "DR:year:dayOfYear" string for an arrival date.
 * Used to chain journey start dates after a completed journey.
 * Returns undefined if no start date was provided.
 */
export function rawHarptosDate(
  journeyStartDate: string | undefined,
  dayIndex: number
): string | undefined {
  const parsed = parseDrString(journeyStartDate);
  if (!parsed) return undefined;
  const { year, dayOfYear } = addDrDays(parsed.year, parsed.dayOfYear, dayIndex);
  return toDrString(year, dayOfYear);
}
