"use client";

import { ImagePlus, Star, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, ApiError } from "@/lib/api";

/** What each star means, said plainly — so the scale isn't left to the learner to invent. */
const RATING_LABELS = [
  "Didn't prepare me",
  "Could be better",
  "Did the job",
  "Really helped",
  "Passed because of it",
];

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  // What the pointer is over, so the row fills as you sweep across it. Cleared on leave, which is
  // what makes the hover a preview rather than something that looks like a choice already made.
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex gap-1" onMouseLeave={() => setHovered(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onFocus={() => setHovered(star)}
            onBlur={() => setHovered(0)}
            aria-pressed={value === star}
            aria-label={`${star} ${star === 1 ? "star" : "stars"} — ${RATING_LABELS[star - 1]}`}
            className="cursor-pointer rounded-lg p-1 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-chart-1 focus-visible:outline-none"
          >
            <Star
              aria-hidden
              className={`size-8 transition-colors ${
                star <= shown
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-neutral-300 dark:text-neutral-600"
              }`}
            />
          </button>
        ))}
      </div>
      {/* Fixed height so naming the rating doesn't shove the rest of the form down. */}
      <p className="flex h-5 items-center text-sm text-muted-foreground">
        {shown ? RATING_LABELS[shown - 1] : "Tap a star"}
      </p>
    </div>
  );
}

/**
 * Asks a learner how it went, right after they say they've sat the written exam.
 *
 * This moment used to go straight to a congratulations card with a link to Trustpilot — the whole
 * opinion handed to a third party, and nothing kept. The rating, the words and the photo are ours
 * now; the congratulations still follows, once there's something to be congratulated for.
 *
 * Only the rating is required. Someone who taps four stars and submits has already told us the
 * most useful thing, and demanding a paragraph for it is how you end up with no ratings at all.
 */
export default function ExamFeedbackDialog({
  open,
  onOpenChange,
  onSubmitted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called once the feedback is safely stored — the caller shows the congratulations. */
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  // File and preview URL together: the URL is made the moment a file is chosen, so there's no
  // render where one exists without the other.
  const [photo, setPhoto] = useState<{ file: File; url: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // Re-opening starts a fresh form. Adjusted while rendering the change rather than in an effect,
  // so the dialog never paints once with the last submission still in it.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setRating(0);
      setComment("");
      setPhoto(null);
      setError(null);
    }
  }

  // An object URL holds the file in memory until it's handed back. Cleanup only — the URL is
  // created where the file is chosen, not here, so this effect never sets state.
  useEffect(() => {
    if (!photo) return;
    const { url } = photo;
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  function choosePhoto(file: File | null) {
    setError(null);
    if (file && file.size > MAX_PHOTO_BYTES) {
      setError("That image is over 10MB. Try a smaller one.");
      return;
    }
    setPhoto(file ? { file, url: URL.createObjectURL(file) } : null);
  }

  async function submit() {
    if (rating === 0) {
      setError("Pick a star rating first.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      // Multipart rather than JSON because of the photo; the API client switches on FormData and
      // leaves the Content-Type to the browser, which has to set the boundary itself.
      const body = new FormData();
      body.append("rating", String(rating));
      if (comment.trim()) body.append("comment", comment.trim());
      if (photo) body.append("photo", photo.file);

      await api.post("/me/exam-feedback", body);
      onOpenChange(false);
      onSubmitted();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't send that. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center">
          <DialogTitle className="font-sora text-xl font-semibold">
            How did we do?
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm">
            You&apos;ve sat the real thing — you&apos;re the only one who can
            tell us whether this prepared you for it.
          </DialogDescription>
        </div>

        <StarRating value={rating} onChange={setRating} />

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={5000}
          placeholder="What helped, and what got in the way? (optional)"
          className="w-full resize-none rounded-xl border border-border bg-card p-3 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-chart-1 focus-visible:ring-3 focus-visible:ring-chart-1/25"
        />

        {photo ? (
          <div className="relative overflow-hidden rounded-xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt="The photo you chose" className="max-h-48 w-full object-cover" />
            <button
              type="button"
              onClick={() => {
                choosePhoto(null);
                if (fileInput.current) fileInput.current.value = "";
              }}
              aria-label="Remove photo"
              className="absolute top-2 right-2 flex size-7 cursor-pointer items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm transition-colors hover:bg-background"
            >
              <X aria-hidden className="size-4" />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground">
            <ImagePlus aria-hidden className="size-4" />
            Add a photo (optional)
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => choosePhoto(e.target.files?.[0] ?? null)}
            />
          </label>
        )}

        {error && <p className="text-destructive text-sm">{error}</p>}

        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="h-12 w-full cursor-pointer rounded-lg bg-blue-600 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Send feedback"}
        </button>
      </DialogContent>
    </Dialog>
  );
}
