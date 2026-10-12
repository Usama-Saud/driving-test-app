<?php

namespace App\Http\Resources\Api\V1\Admin;

use App\Models\ExamFeedback;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ExamFeedback */
class ExamFeedbackResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'rating' => $this->rating,
            'comment' => $this->comment,
            'photo_url' => $this->photo_url,
            // Null once the account is gone — the feedback outlives it on purpose, so the admin
            // list has to be able to show a verdict with nobody attached to it.
            'user' => $this->whenLoaded('user', fn () => $this->user === null ? null : [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ]),
            'created_at' => $this->created_at,
        ];
    }
}
