<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'staff_user_id',
    'visitor_token',
    'registered_user_id',
    'landing_url',
    'ip_address',
    'user_agent',
    'clicked_at',
    'expires_at',
])]
class StaffReferralClick extends Model
{
    protected function casts(): array
    {
        return [
            'clicked_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_user_id');
    }

    public function registeredUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registered_user_id');
    }
}
