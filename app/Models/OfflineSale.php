<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['sale_number', 'customer_profile_id', 'lead_id', 'field_staff_id', 'event_id', 'payment_method_id', 'source', 'customer_name', 'customer_whatsapp_number', 'total', 'notes', 'sold_at'])]
class OfflineSale extends Model
{
    protected function casts(): array
    {
        return [
            'total' => 'decimal:2',
            'sold_at' => 'datetime',
        ];
    }

    public function customerProfile(): BelongsTo
    {
        return $this->belongsTo(CustomerProfile::class);
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    public function fieldStaff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'field_staff_id');
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function offlineSaleItems(): HasMany
    {
        return $this->hasMany(OfflineSaleItem::class);
    }

    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }
}
