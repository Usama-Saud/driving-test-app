"use client";

import { CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";
import Calendar, {
  daysBetween,
  fromKey,
  toKey,
} from "@/components/ui/Calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import Toast from "@/components/ui/Toast";
import { useExamDate } from "@/lib/useExamDate";

/** A few dates ahead, so the common case is one tap rather than paging through months. */
const SHORTCUTS = [
  { label: "In 2 weeks", days: 14 },
  { label: "In 1 month", days: 30 },
  { label: "In 3 months", days: 90 },
];

function addDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toKey(date);
}

function formatLong(key: string): string {
  return fromKey(key).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** "in 12 days", "tomorrow", "today" — the thing a learner actually wants to know from a date. */
function countdown(key: string): string {
  const days = daysBetween(new Date(), fromKey(key));
  if (days === 0) return "That's today.";
  if (days === 1) return "That's tomorrow.";
  if (days < 0) return `That was ${Math.abs(days)} days ago.`;
  if (days < 14) return `That's ${days} days away.`;
  if (days < 60) return `That's about ${Math.round(days / 7)} weeks away.`;
  return `That's about ${Math.round(days / 30)} months away.`;
}

/**
 * Picking the date of the official exam.
 *
 * The date was previously only editable through a bare `<input type="date">` in the progress rail,
 * which on most desktop browsers is a small text field with a tiny icon — fine for a date you know
 * by heart, poor for one you are choosing. Choosing is the actual task here, so this shows the
 * month, how far away the day is, and the two or three dates most people pick.
 *
 * Nothing is saved until Save: paging around a calendar shouldn't rewrite the learner's plan.
 */
export default function ExamDateDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Lets a caller refresh whatever it shows alongside the date. */
  onSaved?: () => void;
}) {
  const { examDate, save, saving, error } = useExamDate();
  const [draft, setDraft] = useState<string | null>(examDate);

  // Re-opening should offer the saved date again, not whatever was last clicked and abandoned.
  // Adjusted while rendering the change rather than in an effect, so the dialog never paints once
  // with the stale draft and then again with the right one.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(examDate);
  }

  // The dialog closes on a successful save, taking its own confirmation with it — so the
  // confirmation goes to a toast, which outlives it. A failure keeps the dialog open and shows
  // `error` in place, where the learner still has the date they were trying to save.
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  async function commit(next: string | null) {
    if (await save(next)) {
      onOpenChange(false);
      onSaved?.();
      setToast(
        next ? `Exam date set to ${formatLong(next)}.` : "Exam date cleared.",
      );
    }
  }

  return (
    <>
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-sm">
          <div className="flex items-center gap-2">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-600/10">
              <CalendarDays
                aria-hidden
                className="size-4.5 text-blue-700 dark:text-blue-300"
              />
            </span>
            <div>
              <DialogTitle className="text-base">
                When is your exam?
              </DialogTitle>
              <DialogDescription className="text-xs">
                We&apos;ll pace your practice around it. You can change it any
                time.
              </DialogDescription>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {SHORTCUTS.map((shortcut) => {
              const key = addDays(shortcut.days);
              return (
                <button
                  key={shortcut.label}
                  type="button"
                  onClick={() => setDraft(key)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    draft === key
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                  }`}
                >
                  {shortcut.label}
                </button>
              );
            })}
          </div>

          <Calendar value={draft} onChange={setDraft} />

          <p className="flex h-5 items-center text-sm text-muted-foreground">
            {draft ? countdown(draft) : "No date set yet."}
          </p>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={saving || !draft || draft === examDate}
              onClick={() => commit(draft)}
              className="h-11 flex-1 cursor-pointer rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save date"}
            </button>
            {examDate && (
              <button
                type="button"
                disabled={saving}
                onClick={() => commit(null)}
                className="h-11 cursor-pointer rounded-lg px-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              >
                Clear
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
