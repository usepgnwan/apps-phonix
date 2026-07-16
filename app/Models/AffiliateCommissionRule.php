<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'name',
    'product_id',
    'service_id',
    'commission_type',
    'commission_value',
    'is_active',
    'sort_order',
])]
class AffiliateCommissionRule extends Model
{
    public const TYPE_FIXED = 'fixed';

    public const TYPE_PERCENT = 'percent';

    protected function casts(): array
    {
        return [
            'commission_value' => 'decimal:2',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function calculate(float $transactionAmount): float
    {
        if ($this->commission_type === self::TYPE_FIXED) {
            return round((float) $this->commission_value, 2);
        }

        return round($transactionAmount * ((float) $this->commission_value / 100), 2);
    }
}
