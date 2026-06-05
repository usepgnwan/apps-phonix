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

        abort_unless($user !== null && $user->role === 'admin' && $user->is_active, 403);
    }

    public function index(): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Admin/Vouchers/Index', [
            'page' => 'admin.vouchers.index',
            'vouchers' => Voucher::query()
                ->withCount(['orders', 'voucherRedemptions'])
                ->latest()
                ->get(),
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

    public function redemptions(Voucher $voucher): Response
    {
        $this->authorizeAdmin();

        $voucher->loadCount(['orders', 'voucherRedemptions']);
        $redemptions = $voucher->voucherRedemptions()->with(['customerProfile', 'order'])->latest()->get();

        return Inertia::render('Admin/Vouchers/Redemptions/Index', [
            'page' => 'admin.vouchers.redemptions.index',
            'voucher' => $voucher,
            'redemptions' => $redemptions,
        ]);
    }
}
