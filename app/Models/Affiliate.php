<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'user_id',
    'partner_code',
    'coupon_code',
    'voucher_id',
    'status',
    'full_name',
    'email',
    'whatsapp',
    'city',
    'age',
    'platforms',
    'media_url',
    'photo_path',
    'payout_method',
    'payout_account_number',
    'payout_account_name',
    'admin_notes',
    'rejection_reason',
    'submitted_at',
    'approved_at',
    'approved_by',
    'rejected_at',
    'rejected_by',
    'suspended_at',
])]
class Affiliate extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_ACTIVE = 'active';

    public const STATUS_REJECTED = 'rejected';

    public const STATUS_SUSPENDED = 'suspended';

    protected function casts(): array
    {
        return [
            'platforms' => 'array',
            'age' => 'integer',
            'submitted_at' => 'datetime',
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
            'suspended_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(Voucher::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function rejectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    public function referrals(): HasMany
    {
        return $this->hasMany(AffiliateReferral::class);
    }

    public function commissions(): HasMany
    {
        return $this->hasMany(AffiliateCommission::class);
    }

    public function payouts(): HasMany
    {
        return $this->hasMany(AffiliatePayout::class);
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function trackingUrl(): string
    {
        if ($this->partner_code === null) {
            return '';
        }

        return url('/r/'.$this->partner_code);
    }

    public function approvedBalance(): float
    {
        return (float) $this->commissions()
            ->where('status', AffiliateCommission::STATUS_APPROVED)
            ->whereNull('affiliate_payout_id')
            ->sum('commission_amount');
    }

    public function holdBalance(): float
    {
        return (float) $this->commissions()
            ->where('status', AffiliateCommission::STATUS_HOLD)
            ->sum('commission_amount');
    }
}
