"use client";
import { useState, useEffect } from "react";
import {
  parseDrString,
  toDrString,
  harptosDateToString,
  daysInYear,
} from "@/lib/harptos";

interface Props {
  value: string;
  onChange: (drString: string) => void;
}

/**
 * Simplified Dale Reckoning date picker.
 * Two number inputs: year and day-of-year (1–365/366).
 * On blur the formatted Harptos date is shown below the inputs.
 * Internally uses the "DR:{year}:{dayOfYear}" string format.
 */
export default function HarptosDatePicker({ value, onChange }: Props) {
  const parsed = parseDrString(value);
  const initialYear = parsed?.year ?? 1491;
  const initialDoy  = parsed?.dayOfYear ?? 175;

  const [yearStr, setYearStr] = useState(String(initialYear));
  const [doyStr,  setDoyStr]  = useState(String(initialDoy));
  const [displayDate, setDisplayDate] = useState(
    harptosDateToString(initialYear, initialDoy)
  );

  // Sync when the prop changes from outside (e.g. journey advance)
  useEffect(() => {
    const p = parseDrString(value);
    if (!p) return;
    setYearStr(String(p.year));
    setDoyStr(String(p.dayOfYear));
    setDisplayDate(harptosDateToString(p.year, p.dayOfYear));
  }, [value]);

  function commit(ys: string, ds: string) {
    const y = parseInt(ys) || 1491;
    const maxDay = daysInYear(y);
    const d = Math.max(1, Math.min(maxDay, parseInt(ds) || 1));
    const display = harptosDateToString(y, d);
    setDisplayDate(display);
    onChange(toDrString(y, d));
  }

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2" aria-label="Dale Reckoning date picker">
        {/* Year */}
        <div className="flex items-center gap-1">
          <label className="text-stone-400 text-xs">Year</label>
          <input
            type="number"
            aria-label="Year (Dale Reckoning)"
            value={yearStr}
            min={1}
            onChange={(e) => setYearStr(e.target.value)}
            onBlur={(e) => commit(e.target.value, doyStr)}
            className="w-24 bg-stone-800 border border-stone-600 rounded px-2 py-2 text-white focus:outline-none focus:border-amber-500 text-sm"
          />
        </div>

        {/* Day of year */}
        <div className="flex items-center gap-1">
          <label className="text-stone-400 text-xs">Day</label>
          <input
            type="number"
            aria-label="Day of year"
            value={doyStr}
            min={1}
            max={daysInYear(parseInt(yearStr) || 1491)}
            onChange={(e) => setDoyStr(e.target.value)}
            onBlur={(e) => commit(yearStr, e.target.value)}
            className="w-20 bg-stone-800 border border-stone-600 rounded px-2 py-2 text-white focus:outline-none focus:border-amber-500 text-sm"
          />
        </div>
      </div>

      {/* Formatted display shown after blur */}
      {displayDate && (
        <p className="text-amber-300 text-sm font-semibold">
          {displayDate}
        </p>
      )}
    </div>
  );
}
