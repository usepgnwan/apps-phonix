<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'affiliate_id',
    'source_type',
    'source_id',
    'order_item_id',
    'product_id',
    'service_id',
    'item_name',
    'transaction_amount',
    'commission_type',
    'commission_rate',
    'commission_amount',
    'status',
    'hold_until',
    'approved_at',
    'paid_at',
    'cancelled_at',
    'cancel_reason',
    'affiliate_payout_id',
    'meta',
])]
class AffiliateCommission extends Model
{
    public const STATUS_HOLD = 'hold';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_PAID = 'paid';

    public const STATUS_CANCELLED = 'cancelled';

    public const SOURCE_ORDER = 'order';

    public const SOURCE_BOOKING = 'booking';

    protected function casts(): array
    {
        return [
            'transaction_amount' => 'decimal:2',
            'commission_rate' => 'decimal:2',
            'commission_amount' => 'decimal:2',
            'hold_until' => 'datetime',
            'approved_at' => 'datetime',
            'paid_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'meta' => 'array',
        ];
    }

    public function affiliate(): BelongsTo
    {
        return $this->belongsTo(Affiliate::class);
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function payout(): BelongsTo
    {
        return $this->belongsTo(AffiliatePayout::class, 'affiliate_payout_id');
    }
}
