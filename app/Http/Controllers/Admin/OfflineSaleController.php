<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreOfflineSaleRequest;
use App\Models\CustomerProfile;
use App\Models\Event;
use App\Models\Lead;
use App\Models\OfflineSale;
use App\Models\PaymentMethod;
use App\Models\Product;
use App\Models\Service;
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

        $metricsQuery = OfflineSale::query();

        return Inertia::render('Admin/OfflineSales/Index', [
            'metrics' => [
                'total' => (clone $metricsQuery)->count(),
                'revenue' => (clone $metricsQuery)->sum('total'),
                'events' => (clone $metricsQuery)->where('source', 'event')->count(),
                'doorToDoor' => (clone $metricsQuery)->where('source', 'door_to_door')->count(),
            ],
            'offlineSales' => OfflineSale::query()
                ->with(['customerProfile', 'lead', 'fieldStaff', 'event', 'paymentMethod'])
                ->when(request('search'), function ($query, $search) {
                    $query->where('customer_name', 'like', "%{$search}%")
                          ->orWhere('sale_number', 'like', "%{$search}%");
                })
                ->latest()
                ->paginate(10)
                ->withQueryString(),
            'filters' => request()->only(['search']),
            'products' => Product::query()->where('is_active', true)->orderBy('name')->get(),
            'services' => Service::query()->where('is_active', true)->orderBy('name')->get(),
            'customerProfiles' => CustomerProfile::query()->orderBy('name')->get(),
            'leads' => Lead::query()->with(['leadSource', 'assignedStaff', 'customerProfile', 'event'])->latest()->get(),
            'fieldStaff' => User::query()->where('role', 'field_staff')->where('is_active', true)->orderBy('name')->get(['id', 'name', 'email', 'role', 'is_active']),
            'events' => Event::query()->latest()->get(),
            'sources' => ['offline', 'door_to_door', 'event'],
            'paymentMethods' => PaymentMethod::query()->where('is_active', true)->orderBy('bank_name')->get(),
            'recentSale' => session('recentSale'),
        ]);
    }

    public function store(StoreOfflineSaleRequest $request, OfflineSaleService $offlineSaleService): RedirectResponse
    {
        $offlineSale = $offlineSaleService->create($request->validated());

        return redirect()->route('admin.offline-sales.index')->with([
            'success' => 'Penjualan offline berhasil ditambahkan.',
            'recentSale' => $offlineSale,
        ]);
    }

    public function show(OfflineSale $offlineSale): Response
    {
        $this->authorizeAdmin();

        $offlineSale->load(['offlineSaleItems.product', 'offlineSaleItems.service', 'customerProfile', 'lead', 'fieldStaff', 'event', 'paymentMethod']);

        return Inertia::render('Admin/OfflineSales/Show', [
            'offlineSale' => $offlineSale,
        ]);
    }

    public function print(OfflineSale $offlineSale)
    {
        $this->authorizeAdmin();

        $offlineSale->load(['offlineSaleItems.product', 'offlineSaleItems.service', 'paymentMethod']);

        return view('admin.offline_sales.print', [
            'sale' => $offlineSale,
        ]);
    }
}
