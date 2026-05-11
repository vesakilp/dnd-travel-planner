import { describe, expect, it } from "vitest";
import { buildInterleavedNarratives, extractNarrativeByDay } from "../ResultsPanel";

describe("extractNarrativeByDay", () => {
  it("returns empty map when no markers are present", () => {
    const result = extractNarrativeByDay("No day labels here", /^Day\s+(\d+)\s*:/gim);
    expect(result.size).toBe(0);
  });

  it("extracts numbered day blocks", () => {
    const text = "Day 1: One.\nMore one.\nDay 3: Three.";
    const result = extractNarrativeByDay(text, /^Day\s+(\d+)\s*:/gim);
    expect(result.get(1)).toBe("Day 1: One.\nMore one.");
    expect(result.get(3)).toBe("Day 3: Three.");
  });
});

describe("buildInterleavedNarratives", () => {
  it("returns null when either language is missing", () => {
    expect(buildInterleavedNarratives("Day 1: EN", undefined)).toBeNull();
    expect(buildInterleavedNarratives(undefined, "Päivä 1: FI")).toBeNull();
  });

  it("returns null when neither narrative has day markers", () => {
    const result = buildInterleavedNarratives("English text only", "Suomi teksti vain");
    expect(result).toBeNull();
  });

  it("interleaves day blocks in day order", () => {
    const en = "Day 2: EN two.\nDay 1: EN one.";
    const fi = "Päivä 1: FI yksi.\nPäivä 2: FI kaksi.";
    const result = buildInterleavedNarratives(en, fi);
    expect(result).toEqual([
      "Day 1: EN one.",
      "Päivä 1: FI yksi.",
      "Day 2: EN two.",
      "Päivä 2: FI kaksi.",
    ]);
  });

  it("handles missing day in one language", () => {
    const en = "Day 1: EN one.\nDay 2: EN two.";
    const fi = "Päivä 1: FI yksi.";
    const result = buildInterleavedNarratives(en, fi);
    expect(result).toEqual([
      "Day 1: EN one.",
      "Päivä 1: FI yksi.",
      "Day 2: EN two.",
    ]);
  });
});
