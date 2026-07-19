<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable([
    'name',
    'email',
    'password',
    'role',
    'is_active',
    'phone_number',
    'team_id',
    'position_id',
    'photo',
    'branch_id',
    'admin_scope',
    'staff_code',
    'staff_referral_enabled',
    'referred_by_staff_id',
    'referred_at',
])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'staff_referral_enabled' => 'boolean',
            'referred_at' => 'datetime',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin' && $this->is_active === true;
    }

    public function isAdminPusat(): bool
    {
        return $this->isAdmin() && $this->admin_scope !== 'branch';
    }

    public function isAdminCabang(): bool
    {
        return $this->isAdmin() && $this->admin_scope === 'branch';
    }

    public function canAccessBranch(?int $branchId): bool
    {
        if (! $this->isAdmin()) {
            return false;
        }

        if ($this->isAdminPusat()) {
            return true;
        }

        return $this->isAdminCabang()
            && $branchId !== null
            && (int) $this->branch_id === (int) $branchId;
    }

    /**
     * null = semua cabang (admin pusat).
     * array = daftar cabang diizinkan.
     *
     * @return array<int>|null
     */
    public function accessibleBranchIds(): ?array
    {
        if ($this->isAdminPusat()) {
            return null;
        }

        if ($this->isAdminCabang() && $this->branch_id) {
            return [(int) $this->branch_id];
        }

        return [];
    }

    public function applyBranchScope(Builder $query, string $column = 'branch_id'): Builder
    {
        if ($this->isAdminPusat()) {
            return $query;
        }

        if ($this->isAdminCabang() && $this->branch_id) {
            return $query->where($column, (int) $this->branch_id);
        }

        return $query->whereRaw('0 = 1');
    }

    public function ensureCanAccessBranch(
        ?int $branchId,
        string $message = 'Akses ditolak: data bukan milik cabang Anda.'
    ): void {
        abort_unless($this->canAccessBranch($branchId), 403, $message);
    }

    public function forcedBranchId(): ?int
    {
        if ($this->isAdminCabang() && $this->branch_id) {
            return (int) $this->branch_id;
        }

        return null;
    }

    public function customerProfile(): HasOne
    {
        return $this->hasOne(CustomerProfile::class);
    }

    public function affiliate(): HasOne
    {
        return $this->hasOne(Affiliate::class);
    }

    public function isCustomer(): bool
    {
        return $this->role === 'customer' && $this->is_active === true;
    }

    public function isAffiliateActive(): bool
    {
        return $this->affiliate?->status === Affiliate::STATUS_ACTIVE;
    }

    public function hasPendingAffiliateApplication(): bool
    {
        return $this->affiliate?->status === Affiliate::STATUS_PENDING;
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function carts(): HasMany
    {
        return $this->hasMany(Cart::class);
    }

    public function assignedLeads(): HasMany
    {
        return $this->hasMany(Lead::class, 'assigned_staff_id');
    }

    public function leadFollowUps(): HasMany
    {
        return $this->hasMany(LeadFollowUp::class);
    }

    public function createdExaminations(): HasMany
    {
        return $this->hasMany(Examination::class, 'created_by');
    }

    public function createdProductRecommendations(): HasMany
    {
        return $this->hasMany(ProductRecommendation::class, 'created_by');
    }

    public function fieldActivities(): HasMany
    {
        return $this->hasMany(FieldActivity::class, 'field_staff_id');
    }

    public function offlineSales(): HasMany
    {
        return $this->hasMany(OfflineSale::class, 'field_staff_id');
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function isFieldStaff(): bool
    {
        return $this->role === 'field_staff' && $this->is_active === true;
    }

    public function referredByStaff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_by_staff_id');
    }

    public function referredCustomers(): HasMany
    {
        return $this->hasMany(User::class, 'referred_by_staff_id');
    }

    public function staffReferralClicks(): HasMany
    {
        return $this->hasMany(StaffReferralClick::class, 'staff_user_id');
    }
}
