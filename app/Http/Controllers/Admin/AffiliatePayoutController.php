<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Affiliate;
use App\Models\AffiliateCommission;
use App\Models\AffiliatePayout;
use App\Models\User;
use App\Services\Affiliate\AffiliatePayoutService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AffiliatePayoutController extends Controller
{
    private function authorizeAdmin(): User
    {
        $user = request()->user();
        abort_unless($user !== null && $user->isAdmin(), 403);

        return $user;
    }

    public function index(Request $request): Response
    {
        $this->authorizeAdmin();

        $search = $request->input('search');
        $status = $request->input('status');
        $perPage = $request->input('per_page', 10);

        $readyAffiliates = Affiliate::query()
            ->where('status', Affiliate::STATUS_ACTIVE)
            ->with('user:id,name,email')
            ->get()
            ->map(function (Affiliate $affiliate) {
                $approved = (float) AffiliateCommission::query()
                    ->where('affiliate_id', $affiliate->id)
                    ->where('status', AffiliateCommission::STATUS_APPROVED)
                    ->whereNull('affiliate_payout_id')
                    ->sum('commission_amount');

                return [
                    'id' => $affiliate->id,
                    'full_name' => $affiliate->full_name,
                    'partner_code' => $affiliate->partner_code,
                    'payout_method' => $affiliate->payout_method,
                    'payout_account_number' => $affiliate->payout_account_number,
                    'payout_account_name' => $affiliate->payout_account_name,
                    'approved_balance' => $approved,
                ];
            })
            ->filter(fn (array $row) => $row['approved_balance'] >= AffiliatePayoutService::MINIMUM_AMOUNT)
            ->values();

        $payouts = AffiliatePayout::query()
            ->with(['affiliate:id,full_name,partner_code', 'paidBy:id,name'])
            ->when($search, function ($query, $search) {
                $query->whereHas('affiliate', function ($inner) use ($search) {
                    $inner->where('full_name', 'like', "%{$search}%")
                        ->orWhere('partner_code', 'like', "%{$search}%");
                });
            })
            ->when($status && $status !== 'all', fn ($query) => $query->where('status', $status))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Admin/AffiliatePayouts/Index', [
            'page' => 'admin.affiliate-payouts.index',
            'readyAffiliates' => $readyAffiliates,
            'payouts' => $payouts,
            'minimumAmount' => AffiliatePayoutService::MINIMUM_AMOUNT,
            'filters' => $request->only(['search', 'status', 'per_page']),
        ]);
    }

    public function store(Request $request, Affiliate $affiliate, AffiliatePayoutService $payoutService): RedirectResponse
    {
        $this->authorizeAdmin();

        $payoutService->createPendingPayout($affiliate);

        return redirect()
            ->route('admin.affiliate-payouts.index')
            ->with('success', 'Permintaan pencairan berhasil dibuat.');
    }

    public function confirm(Request $request, AffiliatePayout $affiliatePayout, AffiliatePayoutService $payoutService): RedirectResponse
    {
        $admin = $this->authorizeAdmin();

        $notes = $request->validate([
            'admin_notes' => ['nullable', 'string', 'max:1000'],
        ])['admin_notes'] ?? null;

        $payoutService->confirmPaid($affiliatePayout, $admin, $notes);

        return redirect()
            ->route('admin.affiliate-payouts.index')
            ->with('success', 'Pencairan berhasil dikonfirmasi sebagai sudah ditransfer.');
    }
}
