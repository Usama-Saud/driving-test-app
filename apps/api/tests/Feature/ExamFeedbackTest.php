<?php

namespace Tests\Feature;

use App\Models\ExamFeedback;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ExamFeedbackTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_admin_list_is_admin_only(): void
    {
        $this->getJson('/api/v1/admin/exam-feedback')->assertUnauthorized();

        $this->actingAs(User::factory()->create(), 'sanctum')
            ->getJson('/api/v1/admin/exam-feedback')
            ->assertForbidden();
    }

    public function test_the_admin_list_summarises_every_response_not_just_the_page(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        foreach ([5, 5, 3, 1] as $rating) {
            ExamFeedback::create(['user_id' => $admin->id, 'rating' => $rating]);
        }

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/admin/exam-feedback?per_page=5&rating=5')
            ->assertOk();

        // Two rows match the filter, but the summary still describes all four.
        $response->assertJsonCount(2, 'data');
        $response->assertJsonPath('summary.total', 4);
        $response->assertJsonPath('summary.average', 3.5);
        $response->assertJsonPath('summary.by_rating.5', 2);
        $response->assertJsonPath('summary.by_rating.4', 0);
    }

    public function test_an_admin_can_delete_feedback(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $feedback = ExamFeedback::create(['user_id' => $admin->id, 'rating' => 1]);

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/v1/admin/exam-feedback/{$feedback->id}")
            ->assertOk();

        $this->assertDatabaseCount('exam_feedback', 0);
    }

    public function test_it_requires_authentication(): void
    {
        $this->postJson('/api/v1/me/exam-feedback', ['rating' => 5])->assertUnauthorized();
    }

    public function test_a_rating_on_its_own_is_enough(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/me/exam-feedback', ['rating' => 4])
            ->assertCreated();

        $this->assertDatabaseHas('exam_feedback', [
            'user_id' => $user->id,
            'rating' => 4,
            'comment' => null,
        ]);
    }

    public function test_it_stores_the_comment_and_the_photo(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->post('/api/v1/me/exam-feedback', [
                'rating' => 5,
                'comment' => 'Passed first time — the hazard clips were the thing that did it.',
                'photo' => UploadedFile::fake()->image('permit.jpg'),
            ])
            ->assertCreated();

        $feedback = ExamFeedback::query()->sole();
        $this->assertSame('Passed first time — the hazard clips were the thing that did it.', $feedback->comment);
        $this->assertNotNull($feedback->getFirstMedia(ExamFeedback::MEDIA_COLLECTION_PHOTO));
        $this->assertNotNull($feedback->photo_url);
    }

    public function test_the_rating_has_to_be_a_star_count(): void
    {
        $user = User::factory()->create();

        foreach ([0, 6, 'great'] as $rating) {
            $this->actingAs($user, 'sanctum')
                ->postJson('/api/v1/me/exam-feedback', ['rating' => $rating])
                ->assertJsonValidationErrorFor('rating');
        }

        $this->assertDatabaseCount('exam_feedback', 0);
    }

    public function test_a_second_verdict_is_kept_alongside_the_first(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')->postJson('/api/v1/me/exam-feedback', ['rating' => 2])->assertCreated();
        $this->actingAs($user, 'sanctum')->postJson('/api/v1/me/exam-feedback', ['rating' => 5])->assertCreated();

        $this->assertDatabaseCount('exam_feedback', 2);
    }

    public function test_feedback_outlives_the_account_that_left_it(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum')->postJson('/api/v1/me/exam-feedback', ['rating' => 5])->assertCreated();

        $user->delete();

        $this->assertDatabaseHas('exam_feedback', ['user_id' => null, 'rating' => 5]);
    }
}
