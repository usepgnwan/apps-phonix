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

    public function index(\Illuminate\Http\Request $request): Response
    {
        $this->authorizeAdmin();

        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);

        // Menghitung metrik secara keseluruhan
        $metricsQuery = CustomerProfile::query()
            ->withCount(['orders', 'bookings']);
        
        $metrics = [
            'total' => $metricsQuery->count(),
            'members' => CustomerProfile::where('member_status', 'member')->count(),
            'nonMembers' => CustomerProfile::where('member_status', 'non_member')->count(),
            'orders' => CustomerProfile::withCount('orders')->get()->sum('orders_count'),
            'bookings' => CustomerProfile::withCount('bookings')->get()->sum('bookings_count'),
        ];

        $customerProfiles = CustomerProfile::query()
            ->with(['user:id,name,email'])
            ->withCount(['orders', 'bookings', 'voucherRedemptions'])
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('phone_number', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Admin/Customers/Index', [
            'page' => 'admin.customers.index',
            'customerProfiles' => $customerProfiles,
            'metrics' => $metrics,
            'filters' => $request->only(['search', 'per_page']),
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
