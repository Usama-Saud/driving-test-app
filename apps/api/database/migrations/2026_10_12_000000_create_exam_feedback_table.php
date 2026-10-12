<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * What a learner says about the product once they've sat the official written exam — the one
     * moment they can judge whether it prepared them.
     *
     * Deliberately not tied to a quiz, a state or an attempt: this is about the service, not about
     * any one test. The optional photo (a pass certificate, a permit) goes through Media Library
     * like every other user upload, so it lands on whatever disk the rest of the media uses.
     */
    public function up(): void
    {
        Schema::create('exam_feedback', function (Blueprint $table) {
            $table->id();
            // Kept when the account goes: the rating stays meaningful in an average, and the
            // comment stays readable, once it is no longer attributable to anyone.
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedTinyInteger('rating');
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_feedback');
    }
};
