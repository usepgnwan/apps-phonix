<?php

namespace App\Services\Affiliate;

use App\Models\Affiliate;
use App\Models\AffiliateReferral;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Str;

class AffiliateAttributionService
{
    public const COOKIE_NAME = 'affiliate_ref';

    public const COOKIE_DAYS = 30;

    public function resolveActiveByPartnerCode(string $partnerCode): ?Affiliate
    {
        $normalized = Str::upper(trim($partnerCode));

        return Affiliate::query()
            ->where('status', Affiliate::STATUS_ACTIVE)
            ->whereRaw('UPPER(partner_code) = ?', [$normalized])
            ->first();
    }

    public function trackClick(Affiliate $affiliate, Request $request): AffiliateReferral
    {
        $cookieValue = Str::upper($affiliate->partner_code);

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

        return AffiliateReferral::query()->create([
            'affiliate_id' => $affiliate->id,
            'visitor_token' => $request->cookie(self::COOKIE_NAME),
            'referred_user_id' => $request->user()?->id,
            'source' => 'cookie',
            'landing_url' => $request->fullUrl(),
            'ip_address' => $request->ip(),
            'user_agent' => Str::limit((string) $request->userAgent(), 1000, ''),
            'clicked_at' => now(),
            'expires_at' => now()->addDays(self::COOKIE_DAYS),
        ]);
    }

    public function resolveForCheckout(?string $voucherCode, ?int $buyerUserId, Request $request): ?Affiliate
    {
        $fromVoucher = $this->resolveFromVoucherCode($voucherCode);
        if ($fromVoucher !== null && ! $this->isSelfReferral($fromVoucher, $buyerUserId)) {
            return $fromVoucher;
        }

        $fromCookie = $this->resolveFromCookie($request);
        if ($fromCookie !== null && ! $this->isSelfReferral($fromCookie, $buyerUserId)) {
            return $fromCookie;
        }

        return null;
    }

    public function resolveFromVoucherCode(?string $voucherCode): ?Affiliate
    {
        if ($voucherCode === null || trim($voucherCode) === '') {
            return null;
        }

        $voucher = Voucher::query()
            ->where('code', Str::upper(trim($voucherCode)))
            ->whereNotNull('affiliate_id')
            ->first();

        if ($voucher === null) {
            return null;
        }

        return Affiliate::query()
            ->whereKey($voucher->affiliate_id)
            ->where('status', Affiliate::STATUS_ACTIVE)
            ->first();
    }

    public function resolveFromCookie(Request $request): ?Affiliate
    {
        $partnerCode = $request->cookie(self::COOKIE_NAME);

        if ($partnerCode === null || $partnerCode === '') {
            return null;
        }

        return $this->resolveActiveByPartnerCode($partnerCode);
    }

    public function isSelfReferral(Affiliate $affiliate, ?int $buyerUserId): bool
    {
        return $buyerUserId !== null && (int) $affiliate->user_id === (int) $buyerUserId;
    }
}
