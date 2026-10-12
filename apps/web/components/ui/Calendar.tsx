"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * A single-date month calendar.
 *
 * Hand-rolled rather than brought in as a dependency: a month grid is `Date` arithmetic and a
 * seven-column list, and a picker shipped with its own stylesheet costs more to make look like the
 * rest of the product than it costs to write.
 *
 * Dates are passed in and out as `YYYY-MM-DD` strings and never as `Date` objects. An exam date is
 * a day on a calendar, not an instant: `new Date("2026-10-20")` parses as UTC midnight and reads
 * back as the 19th for anyone west of Greenwich, which is exactly the bug that makes a date picker
 * show the day before the one that was saved.
 */

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/** `YYYY-MM-DD` for a local date, without going through UTC. */
function toKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** The local date a `YYYY-MM-DD` string names. */
function fromKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Whole days from `a` to `b`, both taken at local midnight. */
function daysBetween(a: Date, b: Date): number {
  const start = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const end = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((end - start) / 86_400_000);
}

/**
 * The six weeks a month is drawn in, starting on Sunday. Always six, never five or seven, so the
 * grid is the same height every month and the dialog doesn't change size as you page through it.
 */
function monthGrid(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());

  return Array.from({ length: 42 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return day;
  });
}

export default function Calendar({
  value,
  onChange,
  /** Days before this one can't be picked. Defaults to today — you can't sit an exam in the past. */
  min,
}: {
  value: string | null;
  onChange: (next: string) => void;
  min?: string;
}) {
  const today = new Date();
  // A date already saved stays selectable even once it has passed, so a learner whose exam date
  // slipped by can still see it marked and move it, rather than finding their own date greyed out.
  const floor = min ?? toKey(today);
  const minKey = value !== null && value < floor ? value : floor;

  const [month, setMonth] = useState<Date>(() => {
    const anchor = value ? fromKey(value) : today;
    return new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  });

  // Which day the arrow keys are on. Separate from `value`, so moving around doesn't keep saving.
  const [focusedKey, setFocusedKey] = useState<string>(value ?? toKey(today));
  // Set while the keyboard is driving, so the grid doesn't steal focus on a mouse click or on open.
  const movingByKeyboard = useRef(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!movingByKeyboard.current) return;
    movingByKeyboard.current = false;
    gridRef.current?.querySelector<HTMLButtonElement>('[data-focused="true"]')?.focus();
  }, [focusedKey]);

  function moveFocus(byDays: number) {
    const next = fromKey(focusedKey);
    next.setDate(next.getDate() + byDays);
    movingByKeyboard.current = true;
    setFocusedKey(toKey(next));
    // Follow the cursor into a neighbouring month rather than leaving it off-screen.
    setMonth(new Date(next.getFullYear(), next.getMonth(), 1));
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const steps: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
      PageUp: -28,
      PageDown: 28,
    };
    const step = steps[event.key];
    if (step === undefined) return;
    event.preventDefault();
    moveFocus(step);
  }

  const days = monthGrid(month);

  return (
    <div className="select-none">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          aria-label="Previous month"
          className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-chart-1 focus-visible:outline-none"
        >
          <ChevronLeft aria-hidden className="size-4" />
        </button>
        <p aria-live="polite" className="font-semibold text-foreground">
          {month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </p>
        <button
          type="button"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          aria-label="Next month"
          className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-chart-1 focus-visible:outline-none"
        >
          <ChevronRight aria-hidden className="size-4" />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7">
        {WEEKDAYS.map((label) => (
          <span key={label} className="py-1 text-center text-xs font-medium text-muted-foreground">
            {label}
          </span>
        ))}
      </div>

      {/* One tab stop for the whole month, arrow keys inside it — the alternative is forty-two tab
          stops to reach the end of it. Deliberately not `role="grid"`: that role expects rows, and
          this is one flat list laid out in seven columns by CSS. Each day carries its own full
          date as a label, which is what a screen reader actually needs here. */}
      <div
        ref={gridRef}
        role="group"
        aria-label="Choose a date"
        onKeyDown={onKeyDown}
        className="grid grid-cols-7 gap-1"
      >
        {days.map((day) => {
          const key = toKey(day);
          const outside = day.getMonth() !== month.getMonth();
          const disabled = key < minKey;
          const selected = key === value;
          const isToday = key === toKey(today);
          const focused = key === focusedKey;

          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              data-focused={focused}
              tabIndex={focused ? 0 : -1}
              aria-pressed={selected}
              aria-current={isToday ? "date" : undefined}
              aria-label={day.toLocaleDateString(undefined, {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              onClick={() => {
                setFocusedKey(key);
                onChange(key);
              }}
              className={[
                "relative flex aspect-square items-center justify-center rounded-xl text-sm transition-colors",
                "focus-visible:ring-2 focus-visible:ring-chart-1 focus-visible:outline-none",
                disabled
                  ? "cursor-not-allowed text-muted-foreground/40"
                  : "cursor-pointer hover:bg-muted",
                outside && !disabled ? "text-muted-foreground" : "",
                selected
                  ? "bg-blue-600 font-semibold text-white hover:bg-blue-600"
                  : isToday
                    ? "font-semibold text-blue-700 dark:text-blue-300"
                    : "",
              ].join(" ")}
            >
              {day.getDate()}
              {isToday && !selected && (
                <span aria-hidden className="absolute bottom-1 size-1 rounded-full bg-blue-600" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { daysBetween, fromKey, toKey };
