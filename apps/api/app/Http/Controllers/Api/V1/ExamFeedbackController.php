<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreExamFeedbackRequest;
use App\Models\ExamFeedback;
use Illuminate\Http\JsonResponse;

class ExamFeedbackController extends Controller
{
    /**
     * Leave feedback after sitting the official written exam
     *
     * Requires authentication. A star rating, optionally a few words and a photo (a pass slip, a
     * permit). Nothing here is validated against whether the learner really sat an exam — the app
     * has no way to know that, and asking people to prove it before they can praise you is a good
     * way to hear from nobody.
     *
     * Not an upsert: someone who comes back a second time is giving a second verdict, and both are
     * worth having.
     */
    public function store(StoreExamFeedbackRequest $request): JsonResponse
    {
        $feedback = ExamFeedback::create([
            'user_id' => $request->user()->id,
            'rating' => $request->integer('rating'),
            'comment' => $request->string('comment')->toString() ?: null,
        ]);

        if ($photo = $request->file('photo')) {
            $feedback->addMedia($photo)->toMediaCollection(ExamFeedback::MEDIA_COLLECTION_PHOTO);
        }

        return response()->json(['feedback' => $feedback->fresh()], 201);
    }
}
