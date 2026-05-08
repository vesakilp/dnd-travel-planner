"use client";
import { useState, useEffect } from "react";
import {
  segmentsForYear,
  dayOfYearToSegmentDay,
  segmentDayToDayOfYear,
  parseDrString,
  toDrString,
  harptosDateToString,
} from "@/lib/harptos";

interface Props {
  value: string;
  onChange: (drString: string) => void;
}

/**
 * A custom date picker for the Forgotten Realms Harptos (Dale Reckoning) calendar.
 * Internally uses the "DR:{year}:{dayOfYear}" string format.
 */
export default function HarptosDatePicker({ value, onChange }: Props) {
  // Derive initial state from the incoming value
  const parsed = parseDrString(value);
  const initialYear = parsed?.year ?? 1491;
  const initialDoy  = parsed?.dayOfYear ?? 175;

  const [year, setYear] = useState(initialYear);
  const [segmentIndex, setSegmentIndex] = useState(() => {
    const { segmentIndex: si } = dayOfYearToSegmentDay(initialYear, initialDoy);
    return si;
  });
  const [dayInSegment, setDayInSegment] = useState(() => {
    const { dayInSegment: d } = dayOfYearToSegmentDay(initialYear, initialDoy);
    return d;
  });

  // Sync state when the `value` prop changes from outside (e.g. journey advance)
  useEffect(() => {
    const p = parseDrString(value);
    if (!p) return;
    setYear(p.year);
    const { segmentIndex: si, dayInSegment: d } = dayOfYearToSegmentDay(p.year, p.dayOfYear);
    setSegmentIndex(si);
    setDayInSegment(d);
  }, [value]);

  const segments = segmentsForYear(year);
  const currentSegment = segments[segmentIndex] ?? segments[0];

  function emit(y: number, si: number, d: number) {
    const segs = segmentsForYear(y);
    const clampedSi = Math.min(si, segs.length - 1);
    const doy = segmentDayToDayOfYear(y, clampedSi, d);
    onChange(toDrString(y, doy));
  }

  function handleYearChange(e: React.ChangeEvent<HTMLInputElement>) {
    const y = parseInt(e.target.value) || year;
    setYear(y);
    emit(y, segmentIndex, dayInSegment);
  }

  function handleSegmentChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const si = parseInt(e.target.value);
    setSegmentIndex(si);
    // Reset day to 1 when switching segments to avoid out-of-range
    setDayInSegment(1);
    emit(year, si, 1);
  }

  function handleDayChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const d = parseInt(e.target.value);
    setDayInSegment(d);
    emit(year, segmentIndex, d);
  }

  const displayDate = harptosDateToString(
    year,
    segmentDayToDayOfYear(year, segmentIndex, dayInSegment)
  );

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Dale Reckoning date picker">
      {/* Year */}
      <input
        type="number"
        aria-label="Year (Dale Reckoning)"
        value={year}
        onChange={handleYearChange}
        className="w-24 bg-stone-800 border border-stone-600 rounded px-2 py-2 text-white focus:outline-none focus:border-amber-500 text-sm"
        min={1}
      />

      {/* Month / Festival */}
      <select
        aria-label="Month or festival"
        value={segmentIndex}
        onChange={handleSegmentChange}
        className="bg-stone-800 border border-stone-600 rounded px-2 py-2 text-white focus:outline-none focus:border-amber-500 text-sm"
      >
        {segments.map((seg, i) => (
          <option key={seg.name} value={i}>
            {seg.name}{seg.isFestival ? " ✦" : ""}
          </option>
        ))}
      </select>

      {/* Day within month (hidden for festival days) */}
      {!currentSegment.isFestival && (
        <select
          aria-label="Day of month"
          value={dayInSegment}
          onChange={handleDayChange}
          className="w-20 bg-stone-800 border border-stone-600 rounded px-2 py-2 text-white focus:outline-none focus:border-amber-500 text-sm"
        >
          {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      )}

      {/* Formatted display */}
      <span className="text-amber-300 text-sm font-semibold whitespace-nowrap">
        {displayDate}
      </span>

      <span className="text-stone-500 text-xs">DR</span>
    </div>
  );
}
