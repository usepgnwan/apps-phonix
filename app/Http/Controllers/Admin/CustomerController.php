<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateCustomerProfileRequest;
use App\Models\CustomerProfile;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    private function authorizeAdmin(): void
    {
        $user = request()->user();

        abort_unless($user !== null && $user->role === 'admin' && $user->is_active, 403);
    }

    public function index(): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Admin/Customers/Index', [
            'page' => 'admin.customers.index',
            'customerProfiles' => CustomerProfile::query()
                ->with(['user:id,name,email'])
                ->withCount(['orders', 'bookings', 'voucherRedemptions'])
                ->latest()
                ->get(),
        ]);
    }

    public function show(CustomerProfile $customerProfile): Response
    {
        $this->authorizeAdmin();

        $customerProfile->load([
            'user:id,name,email',
            'orders',
            'bookings.service',
            'voucherRedemptions.voucher',
        ]);
        $customerProfile->loadCount(['orders', 'bookings', 'voucherRedemptions']);

        return Inertia::render('Admin/Customers/Show', [
            'page' => 'admin.customers.show',
            'customerProfile' => $customerProfile,
        ]);
    }

    public function update(UpdateCustomerProfileRequest $request, CustomerProfile $customerProfile): RedirectResponse
    {
        $customerProfile->update($request->validated());

        return redirect()->route('admin.customers.show', $customerProfile)->with('success', 'Profil customer berhasil diperbarui.');
    }
}
