<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['order_number', 'user_id', 'customer_profile_id', 'voucher_id', 'payment_method_id', 'customer_name', 'customer_whatsapp_number', 'shipping_address', 'subtotal', 'voucher_discount_amount', 'shipping_cost', 'total', 'courier_name', 'tracking_number', 'shipping_status', 'shipping_notes', 'payment_status', 'payment_received_at', 'payment_notes', 'status', 'admin_notes', 'stock_decremented_at'])]
class Order extends Model
{
    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'voucher_discount_amount' => 'decimal:2',
            'shipping_cost' => 'decimal:2',
            'total' => 'decimal:2',
            'payment_received_at' => 'datetime',
            'stock_decremented_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function customerProfile(): BelongsTo
    {
        return $this->belongsTo(CustomerProfile::class);
    }

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(Voucher::class);
    }

    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function voucherRedemptions(): HasMany
    {
        return $this->hasMany(VoucherRedemption::class);
    }

    public function voucherRedemption(): HasOne
    {
        return $this->hasOne(VoucherRedemption::class);
    }
}
