import { describe, it, expect } from "vitest";
import {
  computeArrival,
  timeOfDayToSlotHour,
  slotHourToLabel,
  nextStageDeparture,
  formatArrivalDate,
} from "../travel-time";

describe("timeOfDayToSlotHour", () => {
  it("morning is 0", () => expect(timeOfDayToSlotHour("morning")).toBe(0));
  it("afternoon is 4", () => expect(timeOfDayToSlotHour("afternoon")).toBe(4));
  it("evening is 8", () => expect(timeOfDayToSlotHour("evening")).toBe(8));
  it("night is 8", () => expect(timeOfDayToSlotHour("night")).toBe(8));
});

describe("computeArrival", () => {
  it("exactly one travel day from morning arrives at evening same day", () => {
    // 8h of travel, depart morning (0h) → arrive evening (8h) day 0
    const result = computeArrival(0, 0, 8);
    expect(result.dayIndex).toBe(0);
    expect(result.slotHour).toBe(8);
  });

  it("half-day travel from morning arrives afternoon same day", () => {
    const result = computeArrival(0, 0, 4);
    expect(result.dayIndex).toBe(0);
    expect(result.slotHour).toBe(4);
  });

  it("short travel from morning arrives mid-morning same day", () => {
    const result = computeArrival(0, 0, 2);
    expect(result.dayIndex).toBe(0);
    expect(result.slotHour).toBe(2);
  });

  it("1.5 days from morning: camp day 0 evening, arrive afternoon day 1", () => {
    // 12h travel: 8h day 0, camp, 4h day 1
    const result = computeArrival(0, 0, 12);
    expect(result.dayIndex).toBe(1);
    expect(result.slotHour).toBe(4);
  });

  it("departs afternoon, half-day travel arrives evening same day", () => {
    const result = computeArrival(0, 4, 4);
    expect(result.dayIndex).toBe(0);
    expect(result.slotHour).toBe(8);
  });

  it("departs afternoon, more than half-day travel camps and continues next day", () => {
    // 6h travel: 4h day 0, camp, 2h day 1
    const result = computeArrival(0, 4, 6);
    expect(result.dayIndex).toBe(1);
    expect(result.slotHour).toBe(2);
  });

  it("departs evening: camps immediately, travels full day next day", () => {
    // evening departure → camp day 0 night → 8h travel day 1
    const result = computeArrival(0, 8, 8);
    expect(result.dayIndex).toBe(1);
    expect(result.slotHour).toBe(8);
  });

  it("departs night: same as evening (camp, start next morning)", () => {
    const result = computeArrival(0, 8, 4);
    expect(result.dayIndex).toBe(1);
    expect(result.slotHour).toBe(4);
  });

  it("two full days of travel from morning", () => {
    // 16h travel: 8h day 0 (morning→evening), camp, 8h day 1 (morning→evening)
    const result = computeArrival(0, 0, 16);
    expect(result.dayIndex).toBe(1);
    expect(result.slotHour).toBe(8);
  });
});

describe("slotHourToLabel", () => {
  it("0 → Morning", () => expect(slotHourToLabel(0)).toBe("Morning"));
  it("2 → Morning", () => expect(slotHourToLabel(2)).toBe("Morning"));
  it("4 → Afternoon", () => expect(slotHourToLabel(4)).toBe("Afternoon"));
  it("6 → Afternoon", () => expect(slotHourToLabel(6)).toBe("Afternoon"));
  it("8 → Evening", () => expect(slotHourToLabel(8)).toBe("Evening"));
});

describe("nextStageDeparture", () => {
  it("arrived at evening → next morning", () => {
    const dep = nextStageDeparture(2, 8, "morning");
    expect(dep.dayIndex).toBe(3);
    expect(dep.slotHour).toBe(0);
  });

  it("arrived at morning, next stage morning → same day", () => {
    const dep = nextStageDeparture(1, 2, "morning");
    // next slot 0 < arrival 2 → camp overnight
    expect(dep.dayIndex).toBe(2);
    expect(dep.slotHour).toBe(0);
  });

  it("arrived at morning, next stage afternoon → same day afternoon", () => {
    const dep = nextStageDeparture(1, 2, "afternoon");
    expect(dep.dayIndex).toBe(1);
    expect(dep.slotHour).toBe(4);
  });

  it("arrived at afternoon, next stage morning → next day morning", () => {
    const dep = nextStageDeparture(2, 4, "morning");
    expect(dep.dayIndex).toBe(3);
    expect(dep.slotHour).toBe(0);
  });
});

describe("formatArrivalDate", () => {
  it("returns Day N when no start date", () => {
    expect(formatArrivalDate(undefined, 0)).toBe("Day 1");
    expect(formatArrivalDate(undefined, 4)).toBe("Day 5");
  });

  it("returns Day N when start date is empty string", () => {
    expect(formatArrivalDate("", 2)).toBe("Day 3");
  });

  it("returns formatted date when start date is provided", () => {
    const result = formatArrivalDate("2024-06-15", 0);
    expect(result).toContain("2024");
    expect(result).toContain("Jun");
    expect(result).toContain("15");
  });

  it("advances the date correctly by dayIndex", () => {
    const result = formatArrivalDate("2024-06-15", 5);
    expect(result).toContain("Jun");
    expect(result).toContain("20");
  });
});
