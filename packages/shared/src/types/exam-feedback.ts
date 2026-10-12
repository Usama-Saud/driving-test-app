/**
 * What a learner said about the product after sitting the official written exam.
 * `user` is null once the account is deleted — the verdict outlives the account that left it.
 */
export type ExamFeedback = {
  id: number;
  rating: number;
  comment: string | null;
  photo_url: string | null;
  user: { id: number; name: string; email: string } | null;
  created_at: string;
};

/**
 * Counts across every piece of feedback, not just the page on screen — the list's filters narrow
 * the rows, never this, so the headline average doesn't shift as you browse.
 */
export type ExamFeedbackSummary = {
  total: number;
  average: number | null;
  /** Keyed "1".."5". */
  by_rating: Record<string, number>;
};
