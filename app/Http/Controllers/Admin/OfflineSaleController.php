<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreOfflineSaleRequest;
use App\Models\CustomerProfile;
use App\Models\Event;
use App\Models\Lead;
use App\Models\OfflineSale;
use App\Models\Product;
use App\Models\User;
use App\Services\OfflineSaleService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class OfflineSaleController extends Controller
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
            'page' => 'admin.offline-sales.index',
            'offlineSales' => OfflineSale::query()
                ->with(['customerProfile', 'lead', 'fieldStaff', 'event'])
                ->latest()
                ->get(),
        ]);
    }

    public function create(): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Welcome', [
            'page' => 'admin.offline-sales.create',
            'products' => Product::query()->where('is_active', true)->orderBy('name')->get(),
            'customerProfiles' => CustomerProfile::query()->orderBy('name')->get(),
            'leads' => Lead::query()->with(['leadSource', 'assignedStaff', 'customerProfile', 'event'])->latest()->get(),
            'fieldStaff' => User::query()->where('role', 'field_staff')->where('is_active', true)->orderBy('name')->get(['id', 'name', 'email', 'role', 'is_active']),
            'events' => Event::query()->latest()->get(),
            'sources' => ['offline', 'door_to_door', 'event'],
        ]);
    }

    public function store(StoreOfflineSaleRequest $request, OfflineSaleService $offlineSaleService): RedirectResponse
    {
        $offlineSale = $offlineSaleService->create($request->validated());

        return redirect()->route('admin.offline-sales.show', $offlineSale)->with('success', 'Penjualan offline berhasil ditambahkan.');
    }

    public function show(OfflineSale $offlineSale): Response
    {
        $this->authorizeAdmin();

        $offlineSale->load(['offlineSaleItems.product', 'customerProfile', 'lead', 'fieldStaff', 'event']);

        return Inertia::render('Welcome', [
            'page' => 'admin.offline-sales.show',
            'offlineSale' => $offlineSale,
        ]);
    }
}
