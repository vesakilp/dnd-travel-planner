import { TimeOfDay } from "./types";

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
  let dayIdx = startDayIndex;
  let slotHour = startSlotHour;

  // If departing at evening or night, camp immediately and resume next morning
  if (slotHour >= 8) {
    dayIdx += 1;
    slotHour = 0;
  }

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
  arrivalSlotHour: number,
  nextTod: TimeOfDay
): { dayIndex: number; slotHour: number } {
  const nextSlotHour = timeOfDayToSlotHour(nextTod);

  if (arrivalSlotHour >= 8) {
    // Arrived at evening — mandatory camp, depart next morning
    return { dayIndex: arrivalDayIndex + 1, slotHour: 0 };
  }

  if (nextSlotHour >= arrivalSlotHour) {
    // Same day is fine
    return { dayIndex: arrivalDayIndex, slotHour: nextSlotHour };
  }

  // Would need to depart before arrival — camp overnight, use declared time next day
  return { dayIndex: arrivalDayIndex + 1, slotHour: nextSlotHour };
}

/**
 * Format an arrival date for display.
 * If journeyStartDate is provided (YYYY-MM-DD), returns a formatted calendar date.
 * Otherwise returns "Day N" (1-based).
 */
export function formatArrivalDate(
  journeyStartDate: string | undefined,
  dayIndex: number
): string {
  if (!journeyStartDate) return `Day ${dayIndex + 1}`;
  try {
    const [y, m, d] = journeyStartDate.split("-").map(Number);
    const date = new Date(y, m - 1, d + dayIndex);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return `Day ${dayIndex + 1}`;
  }
}
