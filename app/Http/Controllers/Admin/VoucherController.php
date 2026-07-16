<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreVoucherRequest;
use App\Http\Requests\Admin\UpdateVoucherRequest;
use App\Models\Voucher;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class VoucherController extends Controller
{
    private function authorizeAdmin(): void
    {
        $user = request()->user();

        abort_unless($user !== null && $user->isAdminPusat(), 403, 'Hanya Admin Pusat yang dapat mengelola voucher.');
    }

    public function index(\Illuminate\Http\Request $request): Response
    {
        $this->authorizeAdmin();

        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);

        $metrics = [
            'total' => Voucher::count(),
            'active' => Voucher::where('is_published', true)->where(function ($query) {
                $query->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            })->count(),
            'expired' => Voucher::where('is_published', false)->orWhere(function ($query) {
                $query->whereNotNull('ends_at')->where('ends_at', '<', now());
            })->count(),
            'orders' => Voucher::withCount('orders')->get()->sum('orders_count'),
            'redemptions' => Voucher::withCount('voucherRedemptions')->get()->sum('voucher_redemptions_count'),
        ];

        $vouchers = Voucher::query()
            ->withCount(['orders', 'voucherRedemptions'])
            ->when($search, function ($query, $search) {
                $query->where('code', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Admin/Vouchers/Index', [
            'page' => 'admin.vouchers.index',
            'vouchers' => $vouchers,
            'metrics' => $metrics,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function create(): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Admin/Vouchers/Create', [
            'page' => 'admin.vouchers.create',
        ]);
    }

    public function store(StoreVoucherRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['code'] = strtoupper($validated['code']);

        Voucher::query()->create($validated);

        return redirect()->route('admin.vouchers.index')->with('success', 'Voucher berhasil disimpan.');
    }

    public function show(Voucher $voucher): Response
    {
        $this->authorizeAdmin();

        $voucher->loadCount(['orders', 'voucherRedemptions']);

        return Inertia::render('Admin/Vouchers/Show', [
            'page' => 'admin.vouchers.show',
            'voucher' => $voucher,
        ]);
    }

    public function edit(Voucher $voucher): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Admin/Vouchers/Edit', [
            'page' => 'admin.vouchers.edit',
            'voucher' => $voucher,
        ]);
    }

    public function update(UpdateVoucherRequest $request, Voucher $voucher): RedirectResponse
    {
        $validated = $request->validated();
        $validated['code'] = strtoupper($validated['code']);

        $voucher->update($validated);

        return redirect()->route('admin.vouchers.index')->with('success', 'Voucher berhasil diperbarui.');
    }

    public function destroy(Voucher $voucher): RedirectResponse
    {
        $this->authorizeAdmin();

        if ($voucher->voucherRedemptions()->exists() || $voucher->orders()->exists()) {
            return redirect()->route('admin.vouchers.index')->with('error', 'Voucher tidak dapat dihapus karena masih memiliki redemptions atau order.');
        }

        $voucher->delete();

        return redirect()->route('admin.vouchers.index')->with('success', 'Voucher berhasil dihapus.');
    }

    public function redemptions(\Illuminate\Http\Request $request, Voucher $voucher): Response
    {
        $this->authorizeAdmin();

        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);

        $voucher->loadCount(['orders', 'voucherRedemptions']);
        
        $metrics = [
            'total_redemptions' => $voucher->voucherRedemptions()->count(),
            'total_discount' => $voucher->voucherRedemptions()->sum('discount_amount'),
        ];
        
        $redemptions = $voucher->voucherRedemptions()
            ->with(['customerProfile', 'order'])
            ->when($search, function ($query, $search) {
                $query->whereHas('customerProfile', function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%");
                })->orWhereHas('order', function ($query) use ($search) {
                    $query->where('order_number', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Admin/Vouchers/Redemptions/Index', [
            'page' => 'admin.vouchers.redemptions.index',
            'voucher' => $voucher,
            'redemptions' => $redemptions,
            'metrics' => $metrics,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }
}
