<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['code', 'name', 'description', 'discount_type', 'discount_value', 'minimum_purchase', 'starts_at', 'ends_at', 'usage_limit', 'is_published'])]
class Voucher extends Model
{
    protected function casts(): array
    {
        return [
            'discount_value' => 'decimal:2',
            'minimum_purchase' => 'decimal:2',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'is_published' => 'boolean',
        ];
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function voucherRedemptions(): HasMany
    {
        return $this->hasMany(VoucherRedemption::class);
    }
}
