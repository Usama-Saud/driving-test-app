"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * The thank-you, shown once a learner's feedback has actually been stored.
 *
 * It used to be the whole of this moment, and it ended in a Trustpilot button — the opinion handed
 * to a third party and nothing kept on our side. ExamFeedbackDialog now asks first and keeps the
 * answer, so by the time this appears there is something real to thank them for, and the link has
 * nothing left to do.
 */
export default function ExamTakenDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/state-hub/leave-review.svg"
          alt=""
          aria-hidden
          className="w-full"
        />

        <div className="flex flex-col items-center gap-3 px-6 pt-5 pb-8 text-center">
          <DialogTitle className="font-sora text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            Thank you!
          </DialogTitle>
          <DialogDescription className="text-base leading-6 text-neutral-700 dark:text-neutral-300">
            Your journey matters to us, and your feedback fuels our passion to
            improve and provide the best learning tools for drivers across the
            country.
          </DialogDescription>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="mt-2 h-12 w-full cursor-pointer rounded-lg bg-blue-600 text-base font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
