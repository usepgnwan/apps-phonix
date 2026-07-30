<?php

namespace App\Services\StaffReferral;

use App\Models\StaffReferralClick;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Str;

class StaffReferralAttributionService
{
    public const COOKIE_NAME = 'staff_ref';

    public const COOKIE_DAYS = 30;

    public function resolveActiveByStaffCode(string $staffCode): ?User
    {
        $normalized = Str::upper(trim($staffCode));

        if ($normalized === '') {
            return null;
        }

        return User::query()
            ->where('role', 'field_staff')
            ->where('is_active', true)
            ->where('staff_referral_enabled', true)
            ->whereNotNull('staff_code')
            ->whereRaw('UPPER(staff_code) = ?', [$normalized])
            ->first();
    }

    public function trackClick(User $staff, Request $request): StaffReferralClick
    {
        $cookieValue = Str::upper((string) $staff->staff_code);

        Cookie::queue(
            cookie(
                self::COOKIE_NAME,
                $cookieValue,
                self::COOKIE_DAYS * 24 * 60,
                '/',
                null,
                false,
                false,
                false,
                'lax'
            )
        );

        return StaffReferralClick::query()->create([
            'staff_user_id' => $staff->id,
            'visitor_token' => $request->cookie(self::COOKIE_NAME),
            'registered_user_id' => null,
            'landing_url' => $request->fullUrl(),
            'ip_address' => $request->ip(),
            'user_agent' => Str::limit((string) $request->userAgent(), 1000, ''),
            'clicked_at' => now(),
            'expires_at' => now()->addDays(self::COOKIE_DAYS),
        ]);
    }

    public function resolveFromCookie(Request $request): ?User
    {
        $staffCode = $request->cookie(self::COOKIE_NAME);

        if ($staffCode === null || $staffCode === '') {
            return null;
        }

        return $this->resolveActiveByStaffCode($staffCode);
    }

    public function resolveFromRequest(Request $request): ?User
    {
        $explicitCode = $request->input('staff_ref') ?? $request->query('ref');

        if (is_string($explicitCode) && trim($explicitCode) !== '') {
            $fromExplicit = $this->resolveActiveByStaffCode($explicitCode);
            if ($fromExplicit !== null) {
                return $fromExplicit;
            }
        }

        return $this->resolveFromCookie($request);
    }

    public function bindOnRegister(User $customer, Request $request): ?User
    {
        if ($customer->referred_by_staff_id !== null) {
            return null;
        }

        $staff = $this->resolveFromRequest($request);

        if ($staff === null) {
            return null;
        }

        $customer->forceFill([
            'referred_by_staff_id' => $staff->id,
            'referred_at' => now(),
        ])->save();

        $latestClick = StaffReferralClick::query()
            ->where('staff_user_id', $staff->id)
            ->whereNull('registered_user_id')
            ->latest('id')
            ->first();

        if ($latestClick !== null) {
            $latestClick->update([
                'registered_user_id' => $customer->id,
            ]);
        }

        return $staff;
    }

    /**
     * Resolve staff attribution for a transaction (order/booking/offline sale).
     *
     * Priority (option 1 — empty input falls back to profile):
     * 1. Explicit staff_ref / ref from request input (checkout form)
     * 2. Buyer's profile referred_by_staff_id (immutable acquisition staff)
     * 3. Cookie staff_ref
     *
     * Does NOT mutate users.referred_by_staff_id.
     */
    public function resolveForTransaction(?int $buyerUserId, Request $request, ?string $explicitStaffCode = null): ?User
    {
        $code = $explicitStaffCode;

        if ($code === null || trim((string) $code) === '') {
            $fromInput = $request->input('staff_ref') ?? $request->input('ref');
            if (is_string($fromInput) && trim($fromInput) !== '') {
                $code = $fromInput;
            }
        }

        if (is_string($code) && trim($code) !== '') {
            $fromExplicit = $this->resolveActiveByStaffCode($code);
            if ($fromExplicit !== null) {
                return $fromExplicit;
            }
            // Invalid explicit code: fall through to profile/cookie (option 1).
        }

        if ($buyerUserId !== null) {
            $fromProfile = $this->resolveFromBuyerProfile($buyerUserId);
            if ($fromProfile !== null) {
                return $fromProfile;
            }
        }

        return $this->resolveFromCookie($request);
    }

    public function resolveFromBuyerProfile(?int $buyerUserId): ?User
    {
        if ($buyerUserId === null) {
            return null;
        }

        $buyer = User::query()->find($buyerUserId);

        if ($buyer?->referred_by_staff_id === null) {
            return null;
        }

        return User::query()
            ->whereKey($buyer->referred_by_staff_id)
            ->where('role', 'field_staff')
            ->where('is_active', true)
            ->where('staff_referral_enabled', true)
            ->first();
    }

    /**
     * Prefill payload for checkout/booking forms: profile staff code if buyer is bound.
     *
     * @return array{staff_code: string, staff_name: string}|null
     */
    public function prefillForBuyer(?int $buyerUserId): ?array
    {
        $staff = $this->resolveFromBuyerProfile($buyerUserId);

        if ($staff === null || $staff->staff_code === null || $staff->staff_code === '') {
            return null;
        }

        return [
            'staff_code' => (string) $staff->staff_code,
            'staff_name' => (string) $staff->name,
        ];
    }

    public function safeRedirectPath(?string $redirect, string $default = '/register'): string
    {
        if ($redirect === null || trim($redirect) === '') {
            return $default;
        }

        $path = trim($redirect);

        if (Str::startsWith($path, ['http://', 'https://', '//'])) {
            return $default;
        }

        if (! Str::startsWith($path, '/')) {
            return $default;
        }

        if (Str::contains($path, ["\r", "\n", '\\'])) {
            return $default;
        }

        return $path;
    }

    public function trackingUrl(User $staff): string
    {
        if ($staff->staff_code === null || $staff->staff_code === '') {
            return '';
        }

        return url('/s/'.$staff->staff_code);
    }
}
