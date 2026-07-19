<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreExaminationRequest;
use App\Models\Booking;
use App\Models\Branch;
use App\Models\CustomerProfile;
use App\Models\Examination;
use App\Models\Product;
use App\Models\User;
use App\Services\ExaminationService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class ExaminationController extends Controller
{
    private function authorizeAdmin(): User
    {
        $user = request()->user();
        abort_unless($user !== null && $user->isAdmin(), 403);

        return $user;
    }

    private function ensureExaminationInScope(User $actor, Examination $examination): void
    {
        abort_unless(
            $examination->isVisibleToAdmin($actor),
            403,
            'Akses ditolak: Pemeriksaan ini tidak terkait cabang Anda.'
        );
    }

    private function staffQueryForAdmin(User $admin)
    {
        $query = User::query()
            ->whereIn('role', ['field_staff', 'admin'])
            ->where('is_active', true)
            ->orderBy('name');

        return $admin->applyBranchScope($query);
    }

    /**
     * Admin pusat: semua cabang aktif. Admin cabang: hanya cabangnya.
     */
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

    /**
     * Resolve branch filter: admin cabang dikunci ke cabangnya;
     * admin pusat boleh pilih branch_id dari request.
     */
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
     * Examination tidak punya branch_id langsung — filter lewat booking/staff/creator/customer activity.
     */
    private function applyOptionalBranchFilter(Builder $query, ?int $branchId): void
    {
        if ($branchId === null) {
            return;
        }

        $query->where(function (Builder $inner) use ($branchId): void {
            $inner->whereHas('booking', fn (Builder $q) => $q->where('branch_id', $branchId))
                ->orWhereHas('customerProfile', fn (Builder $q) => $q->withActivityInBranch($branchId))
                ->orWhereHas('assignedStaff', fn (Builder $q) => $q->where('branch_id', $branchId))
                ->orWhereHas('creator', fn (Builder $q) => $q->where('branch_id', $branchId));
        });
    }

    public function index(Request $request): Response
    {
        $user = $this->authorizeAdmin();

        $search = $request->input('search');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $filter = $request->input('filter');
        $branchId = $this->resolveBranchId($user, $request->input('branch_id'));
        $perPage = $request->input('per_page', 10);

        $metricsQuery = Examination::query()->visibleToAdmin($user);
        $this->applyOptionalBranchFilter($metricsQuery, $branchId);

        $metrics = [
            'total' => (clone $metricsQuery)->count(),
            'withRecommendations' => (clone $metricsQuery)->has('productRecommendations')->count(),
            'assignedToStaff' => (clone $metricsQuery)->whereNotNull('assigned_staff_id')->count(),
        ];

        $query = Examination::query()
            ->visibleToAdmin($user)
            ->with([
                'customerProfile:id,user_id,name,whatsapp_number,primary_address,member_status',
                'booking:id,booking_number,branch_id,service_id',
                'booking.branch:id,name',
                'booking.service:id,name',
                'creator:id,name,branch_id',
                'creator.branch:id,name',
                'assignedStaff:id,name,branch_id',
                'assignedStaff.branch:id,name',
                'productRecommendations:id,examination_id,product_id',
                'productRecommendations.product:id,name',
            ]);

        $this->applyOptionalBranchFilter($query, $branchId);

        if ($search) {
            $query->where(function (Builder $inner) use ($search): void {
                $inner->where('complaint', 'like', "%{$search}%")
                    ->orWhere('service_type', 'like', "%{$search}%")
                    ->orWhere('summary', 'like', "%{$search}%")
                    ->orWhereHas('customerProfile', function (Builder $q) use ($search): void {
                        $q->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('assignedStaff', function (Builder $q) use ($search): void {
                        $q->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('booking', function (Builder $q) use ($search): void {
                        $q->where('booking_number', 'like', "%{$search}%")
                            ->orWhereHas('service', function (Builder $q2) use ($search): void {
                                $q2->where('name', 'like', "%{$search}%");
                            });
                    });
            });
        }

        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        if ($filter === 'with_recommendations') {
            $query->has('productRecommendations');
        } elseif ($filter === 'assigned') {
            $query->whereNotNull('assigned_staff_id');
        }

        $examinations = $query
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        $showBranchFilter = $user->isAdminPusat();
        $lockedBranchName = null;

        if (! $showBranchFilter && $user->isAdminCabang()) {
            $lockedBranchName = $user->branch?->name
                ?? Branch::query()->where('id', $user->branch_id)->value('name');
        }

        return Inertia::render('Admin/Examinations/Index', [
            'examinations' => $examinations,
            'metrics' => $metrics,
            'filters' => [
                'search' => $search,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'filter' => $filter,
                'branch_id' => $branchId,
                'per_page' => $perPage,
            ],
            'branches' => $showBranchFilter ? $this->branchesForActor($user) : [],
            'showBranchFilter' => $showBranchFilter,
            'lockedBranchName' => $lockedBranchName,
        ]);
    }

    public function create(): Response
    {
        $user = $this->authorizeAdmin();

        $customerProfiles = CustomerProfile::query()
            ->visibleToAdmin($user)
            ->orderBy('name')
            ->get();

        $bookingsQuery = $user->applyBranchScope(
            Booking::query()
                ->with(['customerProfile', 'service'])
                ->latest()
        );

        return Inertia::render('Admin/Examinations/Create', [
            'customerProfiles' => $customerProfiles,
            'bookings' => $bookingsQuery->get(),
            'products' => Product::query()->where('is_active', true)->orderBy('name')->get(),
            'fieldStaff' => $this->staffQueryForAdmin($user)->get(['id', 'name', 'email', 'role', 'is_active', 'branch_id']),
        ]);
    }

    public function store(StoreExaminationRequest $request, ExaminationService $examinationService): RedirectResponse
    {
        $user = $this->authorizeAdmin();

        $examination = $examinationService->create($request->validated(), $user);

        return redirect()->route('admin.examinations.show', $examination)->with('success', 'Pemeriksaan berhasil ditambahkan.');
    }

    public function show(Examination $examination): Response
    {
        $user = $this->authorizeAdmin();
        $this->ensureExaminationInScope($user, $examination);

        $examination->load([
            'customerProfile',
            'booking.branch',
            'booking.service',
            'creator.branch',
            'assignedStaff.branch',
            'productRecommendations.product',
        ]);

        return Inertia::render('Admin/Examinations/Show', [
            'examination' => $examination,
        ]);
    }
}
