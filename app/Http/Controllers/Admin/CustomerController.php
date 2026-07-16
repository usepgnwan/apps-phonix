<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateCustomerProfileRequest;
use App\Models\CustomerProfile;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    private function authorizeAdmin(): User
    {
        $user = request()->user();
        abort_unless($user !== null && $user->isAdmin(), 403);

        return $user;
    }

    private function ensureCustomerInScope(User $actor, CustomerProfile $customerProfile): void
    {
        abort_unless(
            $customerProfile->isVisibleToAdmin($actor),
            403,
            'Akses ditolak: Customer ini tidak terkait cabang Anda.'
        );
    }

    public function index(Request $request): Response
    {
        $user = $this->authorizeAdmin();

        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);

        $baseQuery = CustomerProfile::query()->visibleToAdmin($user);

        $metrics = [
            'total' => (clone $baseQuery)->count(),
            'members' => (clone $baseQuery)->where('member_status', 'member')->count(),
            'nonMembers' => (clone $baseQuery)->where('member_status', 'non_member')->count(),
            'orders' => (clone $baseQuery)->withCount('orders')->get()->sum('orders_count'),
            'bookings' => (clone $baseQuery)->withCount('bookings')->get()->sum('bookings_count'),
        ];

        $customerProfiles = CustomerProfile::query()
            ->visibleToAdmin($user)
            ->with(['user:id,name,email'])
            ->withCount(['orders', 'bookings', 'voucherRedemptions'])
            ->when($search, function ($query, $search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('whatsapp_number', 'like', "%{$search}%");
                });
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
        $user = $this->authorizeAdmin();
        $this->ensureCustomerInScope($user, $customerProfile);

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
        $user = $this->authorizeAdmin();
        $this->ensureCustomerInScope($user, $customerProfile);

        $customerProfile->update($request->validated());

        return redirect()->route('admin.customers.show', $customerProfile)->with('success', 'Profil customer berhasil diperbarui.');
    }
}
