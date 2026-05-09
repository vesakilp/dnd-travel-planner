import { describe, it, expect } from "vitest";
import { getEffectiveMilesPerDay, formatDuration, PACE_CONFIG } from "../pace";

describe("PACE_CONFIG", () => {
  it("has correct miles per day for fast", () => {
    expect(PACE_CONFIG.fast.milesPerDay).toBe(30);
  });
  it("has correct miles per day for normal", () => {
    expect(PACE_CONFIG.normal.milesPerDay).toBe(24);
  });
  it("has correct miles per day for slow", () => {
    expect(PACE_CONFIG.slow.milesPerDay).toBe(18);
  });
});

describe("getEffectiveMilesPerDay", () => {
  it("applies terrain multiplier", () => {
    const { effectiveMilesPerDay } = getEffectiveMilesPerDay("normal", 0.5, "none");
    expect(effectiveMilesPerDay).toBe(12);
  });
  it("returns warning for waterborne without override", () => {
    const { warning } = getEffectiveMilesPerDay("normal", 1, "waterborne");
    expect(warning).toContain("Waterborne");
  });
  it("applies vehicle speed override", () => {
    const { effectiveMilesPerDay } = getEffectiveMilesPerDay("normal", 1, "waterborne", 5);
    expect(effectiveMilesPerDay).toBe(40);
  });
  it("uses selected vehicle option speed for land vehicles", () => {
    const { effectiveMilesPerDay } = getEffectiveMilesPerDay("normal", 1, "land_vehicle", 2);
    expect(effectiveMilesPerDay).toBe(16);
  });
});

describe("formatDuration", () => {
  it("formats exact days", () => {
    expect(formatDuration(2)).toBe("2 days");
  });
  it("formats fractional days", () => {
    expect(formatDuration(1.5)).toBe("1 day and 4 hours");
  });
  it("formats less than a day", () => {
    expect(formatDuration(0.5)).toBe("4 hours");
  });
});
