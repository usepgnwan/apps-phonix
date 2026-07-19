<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Branch;
use App\Models\Order;
use App\Models\StaffReferralClick;
use App\Models\User;
use App\Services\StaffReferral\StaffReferralAttributionService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class StaffReferralController extends Controller
{
    private function authorizeAdmin(): User
    {
        $user = request()->user();
        abort_unless($user !== null && $user->isAdmin(), 403);

        return $user;
    }

    private function branchesForActor(User $actor): Collection
    {
        $forcedBranchId = $actor->forcedBranchId();

        if ($forcedBranchId !== null) {
            return Branch::query()
                ->where('id', $forcedBranchId)
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']);
        }

        return Branch::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    private function resolveBranchId(User $user, ?string $requestedBranchId): ?int
    {
        $forcedBranchId = $user->forcedBranchId();

        if ($forcedBranchId !== null) {
            return $forcedBranchId;
        }

        if ($user->isAdminPusat() && $requestedBranchId !== null && $requestedBranchId !== '') {
            return (int) $requestedBranchId;
        }

        return null;
    }

    /**
     * Query field staff in actor scope, with optional branch filter for pusat.
     */
    private function staffQuery(User $actor, ?int $branchId = null): Builder
    {
        $query = User::query()
            ->where('role', 'field_staff')
            ->with(['branch:id,name', 'team:id,name', 'position:id,name']);

        $actor->applyBranchScope($query);

        if ($branchId !== null) {
            $query->where('branch_id', $branchId);
        }

        return $query;
    }

    private function ensureStaffInScope(User $actor, User $staff): void
    {
        abort_unless($staff->role === 'field_staff', 404);

        $actor->ensureCanAccessBranch(
            $staff->branch_id !== null ? (int) $staff->branch_id : null,
            'Anda tidak memiliki akses ke staff cabang lain.'
        );
    }

    public function index(Request $request): Response
    {
        $actor = $this->authorizeAdmin();

        $search = $request->input('search');
        $branchId = $this->resolveBranchId($actor, $request->input('branch_id'));
        $perPage = $request->input('per_page', 10);

        $baseStaffQuery = $this->staffQuery($actor, $branchId);

        $staffIds = (clone $baseStaffQuery)->pluck('id');

        $metrics = [
            'staff_with_code' => (clone $baseStaffQuery)->whereNotNull('staff_code')->count(),
            'total_clicks' => StaffReferralClick::query()
                ->whereIn('staff_user_id', $staffIds)
                ->count(),
            'total_registrations' => User::query()
                ->whereIn('referred_by_staff_id', $staffIds)
                ->count(),
            'total_orders' => Order::query()
                ->whereIn('referred_by_staff_id', $staffIds)
                ->count(),
            'total_bookings' => Booking::query()
                ->whereIn('referred_by_staff_id', $staffIds)
                ->count(),
        ];

        $staff = $this->staffQuery($actor, $branchId)
            ->withCount([
                'staffReferralClicks as click_count',
                'referredCustomers as registration_count',
            ])
            ->when($search, function (Builder $query, string $search): void {
                $query->where(function (Builder $inner) use ($search): void {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone_number', 'like', "%{$search}%")
                        ->orWhere('staff_code', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('registration_count')
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        // Enrich paginated rows with order/booking counts (scoped to referred_by_staff_id).
        $pageStaffIds = collect($staff->items())->pluck('id');
        $orderCounts = Order::query()
            ->whereIn('referred_by_staff_id', $pageStaffIds)
            ->selectRaw('referred_by_staff_id, COUNT(*) as aggregate')
            ->groupBy('referred_by_staff_id')
            ->pluck('aggregate', 'referred_by_staff_id');
        $bookingCounts = Booking::query()
            ->whereIn('referred_by_staff_id', $pageStaffIds)
            ->selectRaw('referred_by_staff_id, COUNT(*) as aggregate')
            ->groupBy('referred_by_staff_id')
            ->pluck('aggregate', 'referred_by_staff_id');

        $staff->getCollection()->transform(function (User $row) use ($orderCounts, $bookingCounts) {
            $row->setAttribute('order_count', (int) ($orderCounts[$row->id] ?? 0));
            $row->setAttribute('booking_count', (int) ($bookingCounts[$row->id] ?? 0));

            return $row;
        });

        $showBranchFilter = $actor->isAdminPusat();
        $lockedBranchName = null;

        if (! $showBranchFilter && $actor->isAdminCabang()) {
            $lockedBranchName = $actor->branch?->name
                ?? Branch::query()->where('id', $actor->branch_id)->value('name');
        }

        return Inertia::render('Admin/StaffReferrals/Index', [
            'page' => 'admin.staff-referrals.index',
            'staff' => $staff,
            'metrics' => $metrics,
            'filters' => [
                'search' => $search,
                'branch_id' => $branchId,
                'per_page' => $perPage,
            ],
            'branches' => $showBranchFilter ? $this->branchesForActor($actor) : [],
            'showBranchFilter' => $showBranchFilter,
            'lockedBranchName' => $lockedBranchName,
        ]);
    }

    public function show(
        Request $request,
        User $staff,
        StaffReferralAttributionService $attributionService
    ): Response {
        $actor = $this->authorizeAdmin();
        $this->ensureStaffInScope($actor, $staff);

        $staff->load(['branch:id,name', 'team:id,name', 'position:id,name']);

        $clickCount = StaffReferralClick::query()
            ->where('staff_user_id', $staff->id)
            ->count();

        $registrationCount = User::query()
            ->where('referred_by_staff_id', $staff->id)
            ->count();

        $orderCount = Order::query()
            ->where('referred_by_staff_id', $staff->id)
            ->count();

        $bookingCount = Booking::query()
            ->where('referred_by_staff_id', $staff->id)
            ->count();

        $registrations = User::query()
            ->where('referred_by_staff_id', $staff->id)
            ->with(['customerProfile:id,user_id,name,whatsapp_number'])
            ->latest('referred_at')
            ->paginate(15, ['*'], 'registrations_page')
            ->withQueryString();

        $recentClicks = StaffReferralClick::query()
            ->where('staff_user_id', $staff->id)
            ->latest('clicked_at')
            ->limit(20)
            ->get([
                'id',
                'landing_url',
                'ip_address',
                'clicked_at',
                'registered_user_id',
            ]);

        return Inertia::render('Admin/StaffReferrals/Show', [
            'page' => 'admin.staff-referrals.show',
            'staff' => $staff,
            'trackingUrl' => $attributionService->trackingUrl($staff),
            'metrics' => [
                'click_count' => $clickCount,
                'registration_count' => $registrationCount,
                'order_count' => $orderCount,
                'booking_count' => $bookingCount,
            ],
            'registrations' => $registrations,
            'recentClicks' => $recentClicks,
        ]);
    }
}
