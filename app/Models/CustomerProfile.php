<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['user_id', 'name', 'whatsapp_number', 'primary_address', 'member_status', 'internal_notes'])]
class CustomerProfile extends Model
{
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function examinations(): HasMany
    {
        return $this->hasMany(Examination::class);
    }

    public function productRecommendations(): HasMany
    {
        return $this->hasMany(ProductRecommendation::class);
    }

    public function voucherRedemptions(): HasMany
    {
        return $this->hasMany(VoucherRedemption::class);
    }

    public function carts(): HasMany
    {
        return $this->hasMany(Cart::class);
    }

    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class);
    }

    public function offlineSales(): HasMany
    {
        return $this->hasMany(OfflineSale::class);
    }

    public function scopeWithActivityInBranch(Builder $query, int $branchId): Builder
    {
        return $query->where(function (Builder $inner) use ($branchId): void {
            $inner->whereHas('orders', fn (Builder $q) => $q->where('branch_id', $branchId))
                ->orWhereHas('bookings', fn (Builder $q) => $q->where('branch_id', $branchId))
                ->orWhereHas('leads', fn (Builder $q) => $q->where('branch_id', $branchId))
                ->orWhereHas('offlineSales', fn (Builder $q) => $q->where('branch_id', $branchId));
        });
    }

    public function scopeVisibleToAdmin(Builder $query, User $admin): Builder
    {
        if ($admin->isAdminPusat()) {
            return $query;
        }

        if ($admin->isAdminCabang() && $admin->branch_id) {
            return $query->withActivityInBranch((int) $admin->branch_id);
        }

        return $query->whereRaw('0 = 1');
    }

    public function isVisibleToAdmin(User $admin): bool
    {
        if ($admin->isAdminPusat()) {
            return true;
        }

        if (! $admin->isAdminCabang() || ! $admin->branch_id) {
            return false;
        }

        $branchId = (int) $admin->branch_id;

        return $this->orders()->where('branch_id', $branchId)->exists()
            || $this->bookings()->where('branch_id', $branchId)->exists()
            || $this->leads()->where('branch_id', $branchId)->exists()
            || $this->offlineSales()->where('branch_id', $branchId)->exists();
    }
}
