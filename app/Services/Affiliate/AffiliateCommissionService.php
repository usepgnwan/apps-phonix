<?php

namespace App\Services\Affiliate;

use App\Models\Affiliate;
use App\Models\AffiliateCommission;
use App\Models\AffiliateCommissionRule;
use App\Models\Booking;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

class AffiliateCommissionService
{
    public const HOLD_DAYS = 7;

    public function createFromOrder(Order $order): void
    {
        if ($order->affiliate_id === null) {
            return;
        }

        if ($order->payment_status !== 'paid') {
            return;
        }

        $affiliate = Affiliate::query()
            ->whereKey($order->affiliate_id)
            ->where('status', Affiliate::STATUS_ACTIVE)
            ->first();

        if ($affiliate === null) {
            return;
        }

        if ((int) $affiliate->user_id === (int) $order->user_id) {
            return;
        }

        $order->loadMissing('orderItems');

        DB::transaction(function () use ($order, $affiliate): void {
            foreach ($order->orderItems as $item) {
                $exists = AffiliateCommission::query()
                    ->where('source_type', AffiliateCommission::SOURCE_ORDER)
                    ->where('source_id', $order->id)
                    ->where('order_item_id', $item->id)
                    ->where('affiliate_id', $affiliate->id)
                    ->exists();

                if ($exists) {
                    continue;
                }

                $rule = AffiliateCommissionRule::query()
                    ->where('is_active', true)
                    ->where('product_id', $item->product_id)
                    ->orderBy('sort_order')
                    ->first();

                if ($rule === null) {
                    continue;
                }

                $transactionAmount = (float) $item->line_total;
                $commissionAmount = $rule->calculate($transactionAmount);

                if ($commissionAmount <= 0) {
                    continue;
                }

                AffiliateCommission::query()->create([
                    'affiliate_id' => $affiliate->id,
                    'source_type' => AffiliateCommission::SOURCE_ORDER,
                    'source_id' => $order->id,
                    'order_item_id' => $item->id,
                    'product_id' => $item->product_id,
                    'service_id' => null,
                    'item_name' => $item->product_name,
                    'transaction_amount' => $transactionAmount,
                    'commission_type' => $rule->commission_type,
                    'commission_rate' => $rule->commission_value,
                    'commission_amount' => $commissionAmount,
                    'status' => AffiliateCommission::STATUS_HOLD,
                    'hold_until' => now()->addDays(self::HOLD_DAYS),
                    'meta' => [
                        'rule_id' => $rule->id,
                        'order_number' => $order->order_number,
                    ],
                ]);
            }
        });
    }

    public function createFromBooking(Booking $booking): void
    {
        if ($booking->affiliate_id === null) {
            return;
        }

        if ($booking->status !== 'completed') {
            return;
        }

        $affiliate = Affiliate::query()
            ->whereKey($booking->affiliate_id)
            ->where('status', Affiliate::STATUS_ACTIVE)
            ->first();

        if ($affiliate === null) {
            return;
        }

        if ((int) $affiliate->user_id === (int) $booking->user_id) {
            return;
        }

        $exists = AffiliateCommission::query()
            ->where('source_type', AffiliateCommission::SOURCE_BOOKING)
            ->where('source_id', $booking->id)
            ->where('affiliate_id', $affiliate->id)
            ->exists();

        if ($exists) {
            return;
        }

        $booking->loadMissing('service');

        $rule = AffiliateCommissionRule::query()
            ->where('is_active', true)
            ->where('service_id', $booking->service_id)
            ->orderBy('sort_order')
            ->first();

        if ($rule === null) {
            return;
        }

        $transactionAmount = (float) ($booking->service?->price ?? 0);
        $commissionAmount = $rule->calculate($transactionAmount);

        if ($commissionAmount <= 0) {
            return;
        }

        AffiliateCommission::query()->create([
            'affiliate_id' => $affiliate->id,
            'source_type' => AffiliateCommission::SOURCE_BOOKING,
            'source_id' => $booking->id,
            'order_item_id' => null,
            'product_id' => null,
            'service_id' => $booking->service_id,
            'item_name' => $booking->service?->name ?? 'Layanan',
            'transaction_amount' => $transactionAmount,
            'commission_type' => $rule->commission_type,
            'commission_rate' => $rule->commission_value,
            'commission_amount' => $commissionAmount,
            'status' => AffiliateCommission::STATUS_HOLD,
            'hold_until' => now()->addDays(self::HOLD_DAYS),
            'meta' => [
                'rule_id' => $rule->id,
                'booking_number' => $booking->booking_number,
            ],
        ]);
    }

    public function approveHeldCommissions(): int
    {
        $count = 0;

        AffiliateCommission::query()
            ->where('status', AffiliateCommission::STATUS_HOLD)
            ->whereNotNull('hold_until')
            ->where('hold_until', '<=', now())
            ->orderBy('id')
            ->chunkById(100, function ($commissions) use (&$count): void {
                foreach ($commissions as $commission) {
                    $commission->update([
                        'status' => AffiliateCommission::STATUS_APPROVED,
                        'approved_at' => now(),
                    ]);
                    $count++;
                }
            });

        return $count;
    }
}
