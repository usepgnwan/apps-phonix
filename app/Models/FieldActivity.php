<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['field_staff_id', 'lead_id', 'activity_type', 'activity_at', 'notes', 'follow_up_status'])]
class FieldActivity extends Model
{
    protected function casts(): array
    {
        return [
            'activity_at' => 'datetime',
        ];
    }

    public function fieldStaff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'field_staff_id');
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }
}
