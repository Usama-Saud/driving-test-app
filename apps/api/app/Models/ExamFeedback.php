<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

/**
 * One learner's verdict on the product, given after they've sat the official written exam.
 */
class ExamFeedback extends Model implements HasMedia
{
    use InteractsWithMedia;

    /** Laravel would otherwise look for `exam_feedbacks`; "feedback" has no plural. */
    protected $table = 'exam_feedback';

    public const MEDIA_COLLECTION_PHOTO = 'photo';

    protected $fillable = [
        'user_id',
        'rating',
        'comment',
    ];

    protected $appends = [
        'photo_url',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
        ];
    }

    public function registerMediaCollections(): void
    {
        // One photo, replaced rather than added to — the form offers a single slot. PDFs and other
        // documents are deliberately not accepted: this is "show us your pass", not a claim form.
        $this->addMediaCollection(self::MEDIA_COLLECTION_PHOTO)
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
    }

    /**
     * @return Attribute<?string, never>
     */
    protected function photoUrl(): Attribute
    {
        return Attribute::get(fn (): ?string => $this->getFirstMediaUrl(self::MEDIA_COLLECTION_PHOTO) ?: null);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
