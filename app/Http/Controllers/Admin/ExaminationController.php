<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreExaminationRequest;
use App\Models\Booking;
use App\Models\CustomerProfile;
use App\Models\Examination;
use App\Models\Product;
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

    public function index(): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Welcome', [
            'page' => 'admin.examinations.index',
            'examinations' => Examination::query()
                ->with(['customerProfile', 'booking', 'creator', 'productRecommendations.product'])
                ->latest()
                ->get(),
        ]);
    }

    public function create(): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Welcome', [
            'page' => 'admin.examinations.create',
            'customerProfiles' => CustomerProfile::query()->orderBy('name')->get(),
            'bookings' => Booking::query()->with(['customerProfile', 'service'])->latest()->get(),
            'products' => Product::query()->where('is_active', true)->orderBy('name')->get(),
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

        $examination->load(['customerProfile', 'booking', 'creator', 'productRecommendations.product']);

        return Inertia::render('Welcome', [
            'page' => 'admin.examinations.show',
            'examination' => $examination,
        ]);
    }
}
