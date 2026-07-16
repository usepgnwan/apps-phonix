<?php

namespace App\Services\Affiliate;

use App\Models\Affiliate;
use App\Models\AffiliateCommission;
use App\Models\AffiliatePayout;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AffiliatePayoutService
{
    public const MINIMUM_AMOUNT = 100000;

    public function createPendingPayout(Affiliate $affiliate, ?User $actor = null): AffiliatePayout
    {
        return DB::transaction(function () use ($affiliate): AffiliatePayout {
            $commissions = AffiliateCommission::query()
                ->where('affiliate_id', $affiliate->id)
                ->where('status', AffiliateCommission::STATUS_APPROVED)
                ->whereNull('affiliate_payout_id')
                ->lockForUpdate()
                ->get();

            $amount = (float) $commissions->sum('commission_amount');

            if ($amount < self::MINIMUM_AMOUNT) {
                throw ValidationException::withMessages([
                    'amount' => 'Saldo siap cair belum mencapai minimum Rp '.number_format(self::MINIMUM_AMOUNT, 0, ',', '.').'.',
                ]);
            }

            if ($commissions->isEmpty()) {
                throw ValidationException::withMessages([
                    'amount' => 'Tidak ada komisi siap cair.',
                ]);
            }

            $payout = AffiliatePayout::query()->create([
                'affiliate_id' => $affiliate->id,
                'amount' => $amount,
                'status' => AffiliatePayout::STATUS_PENDING,
                'period_label' => now()->format('Y-m'),
                'payout_method' => $affiliate->payout_method,
                'payout_account_number' => $affiliate->payout_account_number,
                'payout_account_name' => $affiliate->payout_account_name,
                'requested_at' => now(),
            ]);

            AffiliateCommission::query()
                ->whereIn('id', $commissions->pluck('id'))
                ->update([
                    'affiliate_payout_id' => $payout->id,
                ]);

            return $payout->fresh();
        });
    }

    public function confirmPaid(AffiliatePayout $payout, User $admin, ?string $adminNotes = null): AffiliatePayout
    {
        if ($payout->status === AffiliatePayout::STATUS_PAID) {
            return $payout;
        }

        return DB::transaction(function () use ($payout, $admin, $adminNotes): AffiliatePayout {
            $locked = AffiliatePayout::query()
                ->whereKey($payout->id)
                ->lockForUpdate()
                ->firstOrFail();

            $locked->update([
                'status' => AffiliatePayout::STATUS_PAID,
                'paid_at' => now(),
                'paid_by' => $admin->id,
                'admin_notes' => $adminNotes ?? $locked->admin_notes,
            ]);

            AffiliateCommission::query()
                ->where('affiliate_payout_id', $locked->id)
                ->where('status', AffiliateCommission::STATUS_APPROVED)
                ->update([
                    'status' => AffiliateCommission::STATUS_PAID,
                    'paid_at' => now(),
                ]);

            return $locked->fresh();
        });
    }
}
