<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateCustomerProfileRequest;
use App\Models\CustomerProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
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
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $memberStatus = $request->input('member_status');
        $perPage = $request->input('per_page', 10);

        $metricsQuery = CustomerProfile::query()->visibleToAdmin($user);

        $metrics = [
            'total' => (clone $metricsQuery)->count(),
            'members' => (clone $metricsQuery)->where('member_status', 'member')->count(),
            'nonMembers' => (clone $metricsQuery)->where('member_status', 'non_member')->count(),
        ];

        $query = CustomerProfile::query()
            ->visibleToAdmin($user)
            ->with(['user:id,name,email'])
            ->withCount(['orders', 'bookings', 'voucherRedemptions']);

        if ($search) {
            $query->where(function (Builder $inner) use ($search): void {
                $inner->where('name', 'like', "%{$search}%")
                    ->orWhere('whatsapp_number', 'like', "%{$search}%")
                    ->orWhere('primary_address', 'like', "%{$search}%")
                    ->orWhereHas('user', function (Builder $q) use ($search): void {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        if ($memberStatus === 'member' || $memberStatus === 'non_member') {
            $query->where('member_status', $memberStatus);
        }

        $customerProfiles = $query
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Admin/Customers/Index', [
            'page' => 'admin.customers.index',
            'customerProfiles' => $customerProfiles,
            'metrics' => $metrics,
            'filters' => [
                'search' => $search,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'member_status' => $memberStatus,
                'per_page' => $perPage,
            ],
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
