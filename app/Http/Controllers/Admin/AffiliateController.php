<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RejectAffiliateRequest;
use App\Models\Affiliate;
use App\Models\AffiliateCommission;
use App\Models\AffiliateReferral;
use App\Models\User;
use App\Models\Voucher;
use App\Services\Affiliate\AffiliateCodeGenerator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AffiliateController extends Controller
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

        $metrics = [
            'total' => Affiliate::query()->count(),
            'pending' => Affiliate::query()->where('status', Affiliate::STATUS_PENDING)->count(),
            'active' => Affiliate::query()->where('status', Affiliate::STATUS_ACTIVE)->count(),
            'rejected' => Affiliate::query()->where('status', Affiliate::STATUS_REJECTED)->count(),
        ];

        $affiliates = Affiliate::query()
            ->with(['user:id,name,email'])
            ->withCount([
                'commissions as total_referrals' => fn ($q) => $q->whereIn('status', [
                    AffiliateCommission::STATUS_HOLD,
                    AffiliateCommission::STATUS_APPROVED,
                    AffiliateCommission::STATUS_PAID,
                ]),
            ])
            ->when($search, function ($query, $search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('full_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('whatsapp', 'like', "%{$search}%")
                        ->orWhere('partner_code', 'like', "%{$search}%")
                        ->orWhere('coupon_code', 'like', "%{$search}%")
                        ->orWhere('city', 'like', "%{$search}%");
                });
            })
            ->when($status && $status !== 'all', fn ($query) => $query->where('status', $status))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Admin/Affiliates/Index', [
            'page' => 'admin.affiliates.index',
            'affiliates' => $affiliates,
            'metrics' => $metrics,
            'filters' => $request->only(['search', 'status', 'per_page']),
        ]);
    }

    public function show(Affiliate $affiliate): Response
    {
        $this->authorizeAdmin();

        $affiliate->load(['user:id,name,email', 'voucher:id,code,name', 'approvedBy:id,name', 'rejectedBy:id,name']);

        $commissions = AffiliateCommission::query()
            ->where('affiliate_id', $affiliate->id)
            ->latest()
            ->limit(20)
            ->get();

        $clickCount = AffiliateReferral::query()
            ->where('affiliate_id', $affiliate->id)
            ->count();

        return Inertia::render('Admin/Affiliates/Show', [
            'page' => 'admin.affiliates.show',
            'affiliate' => $affiliate,
            'metrics' => [
                'approved_balance' => $affiliate->approvedBalance(),
                'hold_balance' => $affiliate->holdBalance(),
                'click_count' => $clickCount,
            ],
            'commissions' => $commissions,
        ]);
    }

    public function approve(Affiliate $affiliate, AffiliateCodeGenerator $codeGenerator): RedirectResponse
    {
        $admin = $this->authorizeAdmin();

        if ($affiliate->status === Affiliate::STATUS_ACTIVE) {
            return redirect()
                ->route('admin.affiliates.show', $affiliate)
                ->with('success', 'Affiliate sudah aktif.');
        }

        DB::transaction(function () use ($affiliate, $admin, $codeGenerator): void {
            $partnerCode = $affiliate->partner_code ?: $codeGenerator->generatePartnerCode();
            $couponCode = $affiliate->coupon_code ?: $codeGenerator->generateCouponCode($affiliate->full_name);

            $voucher = $affiliate->voucher_id
                ? Voucher::query()->find($affiliate->voucher_id)
                : null;

            if ($voucher === null) {
                $voucher = Voucher::query()->create([
                    'code' => $couponCode,
                    'name' => 'Kupon Affiliate '.$affiliate->full_name,
                    'description' => 'Kode kupon eksklusif mitra affiliate (tracking).',
                    'discount_type' => 'fixed',
                    'discount_value' => 0,
                    'minimum_purchase' => null,
                    'starts_at' => now(),
                    'ends_at' => now()->addYears(5),
                    'usage_limit' => 999999,
                    'is_published' => true,
                    'target_audience' => 'all',
                    'affiliate_id' => $affiliate->id,
                ]);
            } else {
                $voucher->update([
                    'code' => $couponCode,
                    'is_published' => true,
                    'affiliate_id' => $affiliate->id,
                ]);
            }

            $affiliate->update([
                'status' => Affiliate::STATUS_ACTIVE,
                'partner_code' => $partnerCode,
                'coupon_code' => $couponCode,
                'voucher_id' => $voucher->id,
                'approved_at' => now(),
                'approved_by' => $admin->id,
                'rejected_at' => null,
                'rejected_by' => null,
                'rejection_reason' => null,
                'suspended_at' => null,
            ]);

            if ($voucher->affiliate_id !== $affiliate->id) {
                $voucher->update(['affiliate_id' => $affiliate->id]);
            }
        });

        return redirect()
            ->route('admin.affiliates.show', $affiliate)
            ->with('success', 'Affiliate berhasil disetujui dan kode mitra telah digenerate.');
    }

    public function reject(RejectAffiliateRequest $request, Affiliate $affiliate): RedirectResponse
    {
        $admin = $this->authorizeAdmin();

        $affiliate->update([
            'status' => Affiliate::STATUS_REJECTED,
            'rejection_reason' => $request->validated('rejection_reason'),
            'rejected_at' => now(),
            'rejected_by' => $admin->id,
        ]);

        return redirect()
            ->route('admin.affiliates.show', $affiliate)
            ->with('success', 'Pengajuan affiliate ditolak.');
    }

    public function suspend(Affiliate $affiliate): RedirectResponse
    {
        $this->authorizeAdmin();

        abort_unless($affiliate->status === Affiliate::STATUS_ACTIVE, 422, 'Hanya affiliate aktif yang bisa disuspend.');

        $affiliate->update([
            'status' => Affiliate::STATUS_SUSPENDED,
            'suspended_at' => now(),
        ]);

        return redirect()
            ->route('admin.affiliates.show', $affiliate)
            ->with('success', 'Affiliate berhasil disuspend.');
    }

    public function reactivate(Affiliate $affiliate): RedirectResponse
    {
        $this->authorizeAdmin();

        abort_unless($affiliate->status === Affiliate::STATUS_SUSPENDED, 422, 'Hanya affiliate suspended yang bisa diaktifkan ulang.');

        $affiliate->update([
            'status' => Affiliate::STATUS_ACTIVE,
            'suspended_at' => null,
        ]);

        return redirect()
            ->route('admin.affiliates.show', $affiliate)
            ->with('success', 'Affiliate berhasil diaktifkan kembali.');
    }
}
