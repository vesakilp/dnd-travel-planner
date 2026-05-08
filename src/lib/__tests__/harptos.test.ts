import { describe, it, expect } from "vitest";
import {
  isLeapYear,
  daysInYear,
  harptosDateToString,
  parseDrString,
  toDrString,
  addDrDays,
  segmentsForYear,
  dayOfYearToSegmentDay,
  segmentDayToDayOfYear,
  DEFAULT_DR_DATE,
} from "../harptos";

describe("isLeapYear", () => {
  it("1491 is not a leap year", () => expect(isLeapYear(1491)).toBe(false));
  it("1492 is a leap year",     () => expect(isLeapYear(1492)).toBe(true));
  it("1496 is a leap year",     () => expect(isLeapYear(1496)).toBe(true));
  it("1495 is not a leap year", () => expect(isLeapYear(1495)).toBe(false));
});

describe("daysInYear", () => {
  it("non-leap year has 365 days", () => expect(daysInYear(1491)).toBe(365));
  it("leap year has 366 days",     () => expect(daysInYear(1492)).toBe(366));
});

describe("segmentsForYear", () => {
  it("non-leap year has 17 segments (no Shieldmeet)", () => {
    const segs = segmentsForYear(1491);
    expect(segs.length).toBe(17);
    expect(segs.some((s) => s.name === "Shieldmeet")).toBe(false);
  });

  it("leap year has 18 segments (includes Shieldmeet)", () => {
    const segs = segmentsForYear(1492);
    expect(segs.length).toBe(18);
    expect(segs.some((s) => s.name === "Shieldmeet")).toBe(true);
  });

  it("Hammer starts on day 1", () => {
    const segs = segmentsForYear(1491);
    expect(segs[0].name).toBe("Hammer");
    expect(segs[0].startDay).toBe(1);
  });

  it("Midwinter is on day 31 (non-leap)", () => {
    const segs = segmentsForYear(1491);
    const midwinter = segs.find((s) => s.name === "Midwinter")!;
    expect(midwinter.startDay).toBe(31);
    expect(midwinter.isFestival).toBe(true);
  });

  it("Kythorn starts on day 153 (non-leap)", () => {
    const segs = segmentsForYear(1491);
    const kythorn = segs.find((s) => s.name === "Kythorn")!;
    expect(kythorn.startDay).toBe(153);
  });

  it("Eleasis starts on day 215 in leap year (shifted by Shieldmeet)", () => {
    const segs = segmentsForYear(1492);
    const eleasis = segs.find((s) => s.name === "Eleasis")!;
    expect(eleasis.startDay).toBe(215);
  });

  it("Nightal ends on day 365 (non-leap)", () => {
    const segs = segmentsForYear(1491);
    const nightal = segs[segs.length - 1];
    expect(nightal.name).toBe("Nightal");
    expect(nightal.endDay).toBe(365);
  });

  it("Nightal ends on day 366 (leap)", () => {
    const segs = segmentsForYear(1492);
    const nightal = segs[segs.length - 1];
    expect(nightal.endDay).toBe(366);
  });
});

describe("harptosDateToString", () => {
  it("23 Kythorn 1491 DR", () => {
    expect(harptosDateToString(1491, 175)).toBe("23 Kythorn 1491 DR");
  });

  it("1 Hammer 1491 DR", () => {
    expect(harptosDateToString(1491, 1)).toBe("1 Hammer 1491 DR");
  });

  it("30 Nightal 1491 DR (last day of year)", () => {
    expect(harptosDateToString(1491, 365)).toBe("30 Nightal 1491 DR");
  });

  it("Midwinter 1491 DR (festival)", () => {
    expect(harptosDateToString(1491, 31)).toBe("Midwinter 1491 DR");
  });

  it("Midsummer 1491 DR", () => {
    expect(harptosDateToString(1491, 213)).toBe("Midsummer 1491 DR");
  });

  it("Shieldmeet 1492 DR (leap year, day 214)", () => {
    expect(harptosDateToString(1492, 214)).toBe("Shieldmeet 1492 DR");
  });
});

describe("parseDrString", () => {
  it("parses a valid DR string", () => {
    expect(parseDrString("DR:1491:175")).toEqual({ year: 1491, dayOfYear: 175 });
  });
  it("returns null for empty string", () => expect(parseDrString("")).toBeNull());
  it("returns null for undefined",    () => expect(parseDrString(undefined)).toBeNull());
  it("returns null for invalid format", () => expect(parseDrString("2024-06-15")).toBeNull());
});

describe("toDrString", () => {
  it("formats correctly", () => {
    expect(toDrString(1491, 175)).toBe("DR:1491:175");
  });
});

describe("addDrDays", () => {
  it("same year, no rollover", () => {
    expect(addDrDays(1491, 175, 7)).toEqual({ year: 1491, dayOfYear: 182 });
  });

  it("crosses month boundary", () => {
    // Day 182 (30 Kythorn) + 1 = day 183 (1 Flamerule)
    expect(addDrDays(1491, 182, 1)).toEqual({ year: 1491, dayOfYear: 183 });
  });

  it("crosses year boundary", () => {
    // Day 365 + 1 = day 1 of next year
    expect(addDrDays(1491, 365, 1)).toEqual({ year: 1492, dayOfYear: 1 });
  });

  it("adds 0 days", () => {
    expect(addDrDays(1491, 175, 0)).toEqual({ year: 1491, dayOfYear: 175 });
  });
});

describe("dayOfYearToSegmentDay / segmentDayToDayOfYear round-trip", () => {
  it("round-trips 23 Kythorn 1491", () => {
    const { segmentIndex, dayInSegment } = dayOfYearToSegmentDay(1491, 175);
    const doy = segmentDayToDayOfYear(1491, segmentIndex, dayInSegment);
    expect(doy).toBe(175);
  });

  it("round-trips Midwinter 1491 (festival)", () => {
    const { segmentIndex, dayInSegment } = dayOfYearToSegmentDay(1491, 31);
    const doy = segmentDayToDayOfYear(1491, segmentIndex, dayInSegment);
    expect(doy).toBe(31);
  });
});

describe("DEFAULT_DR_DATE", () => {
  it("is 23 Kythorn 1491 DR", () => {
    const parsed = parseDrString(DEFAULT_DR_DATE)!;
    expect(parsed.year).toBe(1491);
    expect(harptosDateToString(parsed.year, parsed.dayOfYear)).toBe("23 Kythorn 1491 DR");
  });
});
