<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\AffiliateCommissionRule;
use Inertia\Inertia;
use Inertia\Response;

class AffiliateLandingController extends Controller
{
    public function __invoke(): Response
    {
        $user = request()->user();
        $affiliate = $user?->affiliate;

        $rules = AffiliateCommissionRule::query()
            ->with(['product:id,name', 'service:id,name'])
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (AffiliateCommissionRule $rule) => [
                'id' => $rule->id,
                'name' => $rule->name,
                'category' => $rule->product_id ? 'Produk' : 'Layanan',
                'item_name' => $rule->product?->name ?? $rule->service?->name ?? $rule->name,
                'commission_type' => $rule->commission_type,
                'commission_value' => (float) $rule->commission_value,
            ]);

        return Inertia::render('Public/Affiliate/Landing', [
            'commissionRules' => $rules,
            'affiliateStatus' => $affiliate?->status,
            'canApply' => $user !== null
                && $user->isCustomer()
                && ($affiliate === null || $affiliate->status === 'rejected'),
            'isAuthenticatedCustomer' => $user !== null && $user->isCustomer(),
        ]);
    }
}
