<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\UpdateAffiliateSettingsRequest;
use App\Models\Affiliate;
use App\Models\AffiliateCommission;
use App\Models\AffiliateReferral;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AffiliateDashboardController extends Controller
{
    private function activeAffiliate(Request $request): Affiliate|RedirectResponse
    {
        $user = $request->user();
        abort_unless($user !== null && $user->isCustomer(), 403);

        $affiliate = $user->affiliate;

        if ($affiliate === null || ! $affiliate->isActive()) {
            $message = match ($affiliate?->status) {
                Affiliate::STATUS_PENDING => 'Pendaftaran affiliate Anda sedang menunggu review admin.',
                Affiliate::STATUS_REJECTED => 'Pengajuan affiliate ditolak. Anda dapat mendaftar ulang dari halaman program.',
                Affiliate::STATUS_SUSPENDED => 'Akun affiliate Anda sedang disuspend. Hubungi admin untuk informasi lebih lanjut.',
                default => 'Anda belum terdaftar sebagai affiliate aktif.',
            };

            return redirect()
                ->route('affiliate.landing')
                ->with('error', $message);
        }

        return $affiliate;
    }

    public function dashboard(Request $request): Response|RedirectResponse
    {
        $affiliate = $this->activeAffiliate($request);

        if ($affiliate instanceof RedirectResponse) {
            return $affiliate;
        }

        $recentCommissions = AffiliateCommission::query()
            ->where('affiliate_id', $affiliate->id)
            ->latest()
            ->limit(10)
            ->get();

        $clickCount = AffiliateReferral::query()
            ->where('affiliate_id', $affiliate->id)
            ->count();

        return Inertia::render('Customer/Affiliate/Dashboard', [
            'affiliate' => [
                'id' => $affiliate->id,
                'partner_code' => $affiliate->partner_code,
                'coupon_code' => $affiliate->coupon_code,
                'full_name' => $affiliate->full_name,
                'tracking_url' => $affiliate->trackingUrl(),
                'status' => $affiliate->status,
            ],
            'metrics' => [
                'approved_balance' => $affiliate->approvedBalance(),
                'hold_balance' => $affiliate->holdBalance(),
                'click_count' => $clickCount,
            ],
            'recentCommissions' => $recentCommissions,
        ]);
    }

    public function commissions(Request $request): Response|RedirectResponse
    {
        $affiliate = $this->activeAffiliate($request);

        if ($affiliate instanceof RedirectResponse) {
            return $affiliate;
        }

        $commissions = AffiliateCommission::query()
            ->where('affiliate_id', $affiliate->id)
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Customer/Affiliate/Commissions', [
            'affiliate' => [
                'partner_code' => $affiliate->partner_code,
                'coupon_code' => $affiliate->coupon_code,
            ],
            'commissions' => $commissions,
        ]);
    }

    public function settings(Request $request): Response|RedirectResponse
    {
        $affiliate = $this->activeAffiliate($request);

        if ($affiliate instanceof RedirectResponse) {
            return $affiliate;
        }

        return Inertia::render('Customer/Affiliate/Settings', [
            'affiliate' => $affiliate->only([
                'full_name',
                'email',
                'whatsapp',
                'city',
                'platforms',
                'media_url',
                'payout_method',
                'payout_account_number',
                'payout_account_name',
                'partner_code',
                'coupon_code',
            ]),
        ]);
    }

    public function updateSettings(UpdateAffiliateSettingsRequest $request): RedirectResponse
    {
        $affiliate = $this->activeAffiliate($request);

        if ($affiliate instanceof RedirectResponse) {
            return $affiliate;
        }

        $affiliate->update($request->settingsPayload());

        return redirect()
            ->route('customer.affiliate.settings')
            ->with('success', 'Pengaturan affiliate berhasil diperbarui.');
    }
}
