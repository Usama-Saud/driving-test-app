"use client";

import { Star } from "lucide-react";
import { Suspense } from "react";
import type {
  ExamFeedback,
  ExamFeedbackSummary,
  PaginatedResponse,
} from "@driving-test-app/shared";
import AdminGuard from "@/components/admin/AdminGuard";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import AppLayout from "@/components/app/AppLayout";
import { Button } from "@/components/ui/ShadcnButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Paginator from "@/components/ui/Paginator";
import { api } from "@/lib/api";
import {
  useDeleteConfirm,
  usePaginatedList,
  useUrlQuery,
} from "@/hooks/use-paginated-list";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          aria-hidden
          className={`size-4 ${
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-neutral-300 dark:text-neutral-600"
          }`}
        />
      ))}
    </span>
  );
}

/** The whole set at a glance: the average, and how the ratings are spread under it. */
function Summary({ summary }: { summary: ExamFeedbackSummary }) {
  const max = Math.max(1, ...Object.values(summary.by_rating));

  return (
    <Card>
      <CardContent className="flex flex-col gap-6 pt-6 sm:flex-row sm:items-center">
        <div className="shrink-0 text-center sm:w-40">
          <p className="font-overpass text-5xl leading-none font-bold tabular-nums">
            {summary.average?.toFixed(1) ?? "—"}
          </p>
          <div className="mt-2 flex justify-center">
            <Stars rating={Math.round(summary.average ?? 0)} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {summary.total.toLocaleString()}{" "}
            {summary.total === 1 ? "response" : "responses"}
          </p>
        </div>

        {/* Five bars rather than five numbers: the question an average can't answer is whether
            three-star feedback is the middle of a cluster or the gap between two camps. */}
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = summary.by_rating[String(star)] ?? 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-3 text-right tabular-nums text-muted-foreground">
                  {star}
                </span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full bg-amber-400 transition-[width] duration-500"
                    style={{ width: `${(count / max) * 100}%` }}
                  />
                </span>
                <span className="w-10 tabular-nums text-muted-foreground">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function AdminExamFeedbackInner() {
  const { searchParams, filterQuery, page, updateFilter, setPage } =
    useUrlQuery();

  const { data, reload } = usePaginatedList<ExamFeedback>(
    `/admin/exam-feedback${filterQuery ? `?${filterQuery}` : ""}`,
    page,
  );

  // The endpoint returns the standard envelope plus a `summary` sibling. `usePaginatedList` is
  // typed for the envelope alone, so the extra key is read back here rather than widening the
  // hook's generics for one caller.
  const summary = (
    data as (PaginatedResponse<ExamFeedback> & { summary?: ExamFeedbackSummary }) | null
  )?.summary;

  const rows = data?.data ?? [];

  const del = useDeleteConfirm<ExamFeedback>(
    (row) => api.delete(`/admin/exam-feedback/${row.id}`),
    reload,
    "Failed to delete this feedback.",
  );

  return (
    <AdminGuard>
      <AppLayout
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Exam feedback", href: "/admin/exam-feedback" },
        ]}
      >
        <div className="app-page">
          <div className="space-y-0.5">
            <h1 className="text-lg font-semibold">Exam feedback</h1>
            <p className="text-sm text-muted-foreground">
              What learners said after sitting the official written exam
            </p>
          </div>

          {summary && <Summary summary={summary} />}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 sm:items-end">
            <div className="flex w-full flex-col gap-1 sm:col-span-2">
              <label className="text-sm font-medium" htmlFor="f-search">
                Search comments
              </label>
              <input
                id="f-search"
                type="search"
                placeholder="hazard clips"
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                defaultValue={searchParams.get("search") ?? ""}
                onChange={(e) => updateFilter("search", e.target.value)}
              />
            </div>
            <div className="flex w-full flex-col gap-1">
              <label className="text-sm font-medium" htmlFor="f-rating">
                Rating
              </label>
              <select
                id="f-rating"
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={searchParams.get("rating") ?? ""}
                onChange={(e) => updateFilter("rating", e.target.value)}
              >
                <option value="">All ratings</option>
                {[5, 4, 3, 2, 1].map((star) => (
                  <option key={star} value={star}>
                    {star} {star === 1 ? "star" : "stars"}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex w-full flex-col gap-1">
              <label className="text-sm font-medium" htmlFor="f-comment">
                Written
              </label>
              <select
                id="f-comment"
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={searchParams.get("has_comment") ?? ""}
                onChange={(e) => updateFilter("has_comment", e.target.value)}
              >
                <option value="">All</option>
                <option value="1">With a comment</option>
              </select>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Responses{" "}
                <span className="font-normal text-muted-foreground">
                  ({data?.meta.total ?? 0})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {rows.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No feedback matches those filters.
                </div>
              ) : (
                <ul className="divide-y divide-border rounded-md border">
                  {rows.map((row) => (
                    <li key={row.id} className="flex flex-col gap-3 p-4 sm:flex-row">
                      {row.photo_url && (
                        <a
                          href={row.photo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={row.photo_url}
                            alt="Photo attached to this feedback"
                            className="size-20 rounded-lg border border-border object-cover"
                          />
                        </a>
                      )}

                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <Stars rating={row.rating} />
                          <span className="text-sm font-medium">
                            {/* Null once the account is deleted — the feedback stays. */}
                            {row.user?.name ?? "Deleted account"}
                          </span>
                          {row.user && (
                            <span className="text-xs break-all text-muted-foreground">
                              {row.user.email}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(row.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {row.comment ? (
                          <p className="text-sm whitespace-pre-wrap">{row.comment}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            Rating only — no comment left.
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 items-start gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => del.request(row)}
                        >
                          Delete
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {data && data.meta.total > 0 && (
                <Paginator meta={data.meta} onPageChange={setPage} />
              )}
            </CardContent>
          </Card>

          <ConfirmDeleteDialog
            open={del.open}
            onOpenChange={del.setOpen}
            title="Delete this feedback?"
            description={
              del.error ??
              "The rating, the comment and any photo go with it. This cannot be undone."
            }
            onConfirm={del.confirm}
          />
        </div>
      </AppLayout>
    </AdminGuard>
  );
}

export default function AdminExamFeedbackPage() {
  return (
    <Suspense>
      <AdminExamFeedbackInner />
    </Suspense>
  );
}
