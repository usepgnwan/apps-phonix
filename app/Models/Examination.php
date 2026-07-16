<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['customer_profile_id', 'booking_id', 'complaint', 'result', 'result_pdf_path', 'service_type', 'summary', 'internal_recommendation', 'assigned_staff_id', 'created_by'])]
class Examination extends Model
{
    public function customerProfile(): BelongsTo
    {
        return $this->belongsTo(CustomerProfile::class);
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignedStaff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_staff_id');
    }

    public function productRecommendations(): HasMany
    {
        return $this->hasMany(ProductRecommendation::class);
    }

    public function scopeVisibleToAdmin(Builder $query, User $admin): Builder
    {
        if ($admin->isAdminPusat()) {
            return $query;
        }

        if ($admin->isAdminCabang() && $admin->branch_id) {
            $branchId = (int) $admin->branch_id;

            return $query->where(function (Builder $inner) use ($branchId): void {
                $inner->whereHas('booking', fn (Builder $q) => $q->where('branch_id', $branchId))
                    ->orWhereHas('customerProfile', fn (Builder $q) => $q->withActivityInBranch($branchId))
                    ->orWhereHas('assignedStaff', fn (Builder $q) => $q->where('branch_id', $branchId))
                    ->orWhereHas('creator', fn (Builder $q) => $q->where('branch_id', $branchId));
            });
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

        if ($this->booking_id) {
            $bookingBranchId = $this->relationLoaded('booking')
                ? $this->booking?->branch_id
                : $this->booking()->value('branch_id');

            if ((int) $bookingBranchId === $branchId) {
                return true;
            }
        }

        if ($this->assigned_staff_id) {
            $staffBranchId = $this->relationLoaded('assignedStaff')
                ? $this->assignedStaff?->branch_id
                : $this->assignedStaff()->value('branch_id');

            if ((int) $staffBranchId === $branchId) {
                return true;
            }
        }

        if ($this->created_by) {
            $creatorBranchId = $this->relationLoaded('creator')
                ? $this->creator?->branch_id
                : $this->creator()->value('branch_id');

            if ((int) $creatorBranchId === $branchId) {
                return true;
            }
        }

        $customer = $this->relationLoaded('customerProfile')
            ? $this->customerProfile
            : $this->customerProfile()->first();

        return $customer !== null && $customer->isVisibleToAdmin($admin);
    }
}
