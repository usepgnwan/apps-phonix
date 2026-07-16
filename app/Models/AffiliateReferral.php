<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'affiliate_id',
    'visitor_token',
    'referred_user_id',
    'source',
    'landing_url',
    'ip_address',
    'user_agent',
    'clicked_at',
    'expires_at',
])]
class AffiliateReferral extends Model
{
    protected function casts(): array
    {
        return [
            'clicked_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function affiliate(): BelongsTo
    {
        return $this->belongsTo(Affiliate::class);
    }

    public function referredUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_user_id');
    }
}
