<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\Admin\ExamFeedbackResource;
use App\Models\ExamFeedback;
use App\Support\LikeSearch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ExamFeedbackController extends Controller
{
    /**
     * List exam feedback (admin)
     *
     * Requires an admin account. Newest first. Filter with `rating` (1-5), `has_comment`, and
     * `search` (matches the comment). Bare `{data, links, meta}` paginated envelope, plus a
     * `summary` of the whole set — the average and the count per star — alongside it, because a
     * page of twenty rows says nothing about whether the product is landing.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = ExamFeedback::query()->with('user')->latest();

        if ($request->filled('rating')) {
            $query->where('rating', $request->integer('rating'));
        }

        if ($request->boolean('has_comment')) {
            $query->whereNotNull('comment');
        }

        if ($request->filled('search')) {
            LikeSearch::apply($query, $request->string('search')->toString(), ['comment']);
        }

        $perPage = min(max($request->integer('per_page', 20), 5), 100);

        return ExamFeedbackResource::collection($query->paginate($perPage)->withQueryString())
            ->additional(['summary' => $this->summary()]);
    }

    /**
     * Delete a piece of exam feedback (admin)
     *
     * For abuse and for photos that shouldn't have been uploaded. The media goes with it.
     */
    public function destroy(ExamFeedback $examFeedback): JsonResponse
    {
        $examFeedback->delete();

        return response()->json(['deleted' => true]);
    }

    /**
     * Counts across every piece of feedback, not just the page being shown — the filters narrow
     * the list, never the summary, so the headline average doesn't move as you browse.
     *
     * @return array{total: int, average: float|null, by_rating: array<int, int>}
     */
    private function summary(): array
    {
        $counts = ExamFeedback::query()
            ->selectRaw('rating, COUNT(*) as total')
            ->groupBy('rating')
            ->pluck('total', 'rating');

        $total = (int) $counts->sum();
        $weighted = $counts->reduce(fn (int $carry, int $count, int $rating) => $carry + ($rating * $count), 0);

        return [
            'total' => $total,
            'average' => $total > 0 ? round($weighted / $total, 2) : null,
            'by_rating' => collect(range(1, 5))->mapWithKeys(fn (int $star) => [$star => (int) ($counts[$star] ?? 0)])->all(),
        ];
    }
}
