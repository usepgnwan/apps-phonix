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
use Inertia\Inertia;
use Inertia\Response;

class ExaminationController extends Controller
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

        $metrics = [
            'total' => Examination::count(),
            'withRecommendations' => Examination::has('productRecommendations')->count(),
            'assignedToStaff' => Examination::whereNotNull('assigned_staff_id')->count(),
        ];

        $examinations = Examination::query()
            ->with(['customerProfile', 'booking', 'creator', 'assignedStaff', 'productRecommendations.product'])
            ->when($search, function ($query, $search) {
                $query->whereHas('customerProfile', function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%");
                })->orWhereHas('assignedStaff', function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%");
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
        $this->authorizeAdmin();

        return Inertia::render('Admin/Examinations/Create', [
            'customerProfiles' => CustomerProfile::query()->orderBy('name')->get(),
            'bookings' => Booking::query()->with(['customerProfile', 'service'])->latest()->get(),
            'products' => Product::query()->where('is_active', true)->orderBy('name')->get(),
            'fieldStaff' => User::query()
                ->whereIn('role', ['field_staff', 'admin'])
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'role', 'is_active']),
        ]);
    }

    public function store(StoreExaminationRequest $request, ExaminationService $examinationService): RedirectResponse
    {
        $examination = $examinationService->create($request->validated(), $request->user());

        return redirect()->route('admin.examinations.show', $examination)->with('success', 'Pemeriksaan berhasil ditambahkan.');
    }

    public function show(Examination $examination): Response
    {
        $this->authorizeAdmin();

        $examination->load(['customerProfile', 'booking', 'creator', 'assignedStaff', 'productRecommendations.product']);

        return Inertia::render('Admin/Examinations/Show', [
            'examination' => $examination,
        ]);
    }
}
