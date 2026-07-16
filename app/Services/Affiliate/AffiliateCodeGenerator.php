<?php

namespace App\Services\Affiliate;

use App\Models\Affiliate;
use Illuminate\Support\Str;

class AffiliateCodeGenerator
{
    public function generatePartnerCode(): string
    {
        do {
            $code = 'PHNX-'.str_pad((string) random_int(1000, 9999), 4, '0', STR_PAD_LEFT);
        } while (Affiliate::query()->where('partner_code', $code)->exists());

        return $code;
    }

    public function generateCouponCode(string $fullName): string
    {
        $slug = Str::upper(Str::slug(Str::before($fullName, ' '), ''));
        $slug = preg_replace('/[^A-Z0-9]/', '', $slug ?? '') ?: 'MITRA';
        $slug = Str::limit($slug, 12, '');

        $base = 'PHNX-'.$slug;
        $code = $base;
        $suffix = 1;

        while (Affiliate::query()->where('coupon_code', $code)->exists()) {
            $code = $base.$suffix;
            $suffix++;
        }

        return $code;
    }
}
