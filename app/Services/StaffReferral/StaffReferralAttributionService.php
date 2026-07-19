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

    public function resolveForTransaction(?int $buyerUserId, Request $request): ?User
    {
        if ($buyerUserId !== null) {
            $buyer = User::query()->find($buyerUserId);
            if ($buyer?->referred_by_staff_id) {
                $fromRegistration = User::query()
                    ->whereKey($buyer->referred_by_staff_id)
                    ->where('role', 'field_staff')
                    ->where('is_active', true)
                    ->where('staff_referral_enabled', true)
                    ->first();

                if ($fromRegistration !== null) {
                    return $fromRegistration;
                }
            }
        }

        return $this->resolveFromCookie($request);
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
