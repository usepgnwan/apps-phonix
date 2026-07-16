<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePaymentMethodRequest;
use App\Http\Requests\Admin\UpdatePaymentMethodRequest;
use App\Models\PaymentMethod;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PaymentMethodController extends Controller
{
    private function authorizeAdmin(): void
    {
        $user = request()->user();

        abort_unless($user !== null && $user->isAdminPusat(), 403, 'Hanya Admin Pusat yang dapat mengelola metode pembayaran.');
    }

    public function index(\Illuminate\Http\Request $request): Response
    {
        $this->authorizeAdmin();

        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);

        $metrics = [
            'total' => PaymentMethod::count(),
            'active' => PaymentMethod::where('is_active', true)->count(),
            'bankTransfer' => PaymentMethod::where('type', 'bank_transfer')->count(),
            'qris' => PaymentMethod::where('type', 'qris')->count(),
            'cash' => PaymentMethod::where('type', 'cash')->count(),
            'orders' => PaymentMethod::withCount('orders')->get()->sum('orders_count'),
        ];

        $paymentMethods = PaymentMethod::query()
            ->withCount('orders')
            ->when($search, function ($query, $search) {
                $query->where('type', 'like', "%{$search}%")
                      ->orWhere('bank_name', 'like', "%{$search}%")
                      ->orWhere('account_number', 'like', "%{$search}%")
                      ->orWhere('account_name', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Admin/PaymentMethods/Index', [
            'page' => 'admin.payment-methods.index',
            'paymentMethods' => $paymentMethods,
            'metrics' => $metrics,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function store(StorePaymentMethodRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('qris_image')) {
            $data['qris_image_path'] = $request->file('qris_image')->store('payment-methods', 'public');
        } elseif ($data['type'] === 'qris') {
            unset($data['qris_image_path']);
        }

        unset($data['qris_image']);

        PaymentMethod::query()->create($data);

        return redirect()->route('admin.payment-methods.index')->with('success', 'Metode pembayaran berhasil disimpan.');
    }

    public function show(PaymentMethod $paymentMethod): Response
    {
        $this->authorizeAdmin();

        $paymentMethod->loadCount('orders');

        return Inertia::render('Admin/PaymentMethods/Show', [
            'page' => 'admin.payment-methods.show',
            'paymentMethod' => $paymentMethod,
        ]);
    }

    public function update(UpdatePaymentMethodRequest $request, PaymentMethod $paymentMethod): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('qris_image')) {
            $data['qris_image_path'] = $request->file('qris_image')->store('payment-methods', 'public');
        } elseif ($data['type'] === 'qris') {
            unset($data['qris_image_path']);
        }

        unset($data['qris_image']);

        $paymentMethod->update($data);

        return redirect()->route('admin.payment-methods.index')->with('success', 'Metode pembayaran berhasil diperbarui.');
    }

    public function destroy(PaymentMethod $paymentMethod): RedirectResponse
    {
        $this->authorizeAdmin();

        if ($paymentMethod->orders()->exists()) {
            return redirect()->route('admin.payment-methods.index')->with('error', 'Metode pembayaran tidak dapat dihapus karena masih memiliki order.');
        }

        $paymentMethod->delete();

        return redirect()->route('admin.payment-methods.index')->with('success', 'Metode pembayaran berhasil dihapus.');
    }
}
