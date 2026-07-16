<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreExaminationRequest;
use App\Models\Booking;
use App\Models\CustomerProfile;
use App\Models\Examination;
use App\Models\Product;
use App\Models\User;
use App\Services\ExaminationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

    public function index(Request $request): Response
    {
        $user = $this->authorizeAdmin();

        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);

        $baseQuery = Examination::query()->visibleToAdmin($user);

        $metrics = [
            'total' => (clone $baseQuery)->count(),
            'withRecommendations' => (clone $baseQuery)->has('productRecommendations')->count(),
            'assignedToStaff' => (clone $baseQuery)->whereNotNull('assigned_staff_id')->count(),
        ];

        $examinations = Examination::query()
            ->visibleToAdmin($user)
            ->with(['customerProfile', 'booking', 'creator', 'assignedStaff', 'productRecommendations.product'])
            ->when($search, function ($query, $search) {
                $query->where(function ($inner) use ($search) {
                    $inner->whereHas('customerProfile', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    })->orWhereHas('assignedStaff', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
                });
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Admin/Examinations/Index', [
            'examinations' => $examinations,
            'metrics' => $metrics,
            'filters' => $request->only(['search', 'per_page']),
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

        $examination->load(['customerProfile', 'booking', 'creator', 'assignedStaff', 'productRecommendations.product']);

        return Inertia::render('Admin/Examinations/Show', [
            'examination' => $examination,
        ]);
    }
}
