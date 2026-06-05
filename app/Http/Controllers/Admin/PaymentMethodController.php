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

        abort_unless($user !== null && $user->role === 'admin' && $user->is_active, 403);
    }

    public function index(): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Admin/PaymentMethods/Index', [
            'page' => 'admin.payment-methods.index',
            'paymentMethods' => PaymentMethod::query()
                ->withCount('orders')
                ->latest()
                ->get(),
        ]);
    }

    public function create(): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Admin/PaymentMethods/Create', [
            'page' => 'admin.payment-methods.create',
        ]);
    }

    public function store(StorePaymentMethodRequest $request): RedirectResponse
    {
        PaymentMethod::query()->create($request->validated());

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

    public function edit(PaymentMethod $paymentMethod): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Admin/PaymentMethods/Edit', [
            'page' => 'admin.payment-methods.edit',
            'paymentMethod' => $paymentMethod,
        ]);
    }

    public function update(UpdatePaymentMethodRequest $request, PaymentMethod $paymentMethod): RedirectResponse
    {
        $paymentMethod->update($request->validated());

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
