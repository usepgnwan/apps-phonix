<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\CustomerProfile;
use App\Models\Examination;
use App\Models\FieldActivity;
use App\Models\Lead;
use App\Models\OfflineSale;
use App\Models\Order;
use App\Models\Product;
use App\Models\Service;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
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
            'page' => 'admin.dashboard.index',
            'summary' => [
                'products' => Product::query()->count(),
                'services' => Service::query()->count(),
                'orders' => Order::query()->count(),
                'bookings' => Booking::query()->count(),
                'leads' => Lead::query()->count(),
                'customerProfiles' => CustomerProfile::query()->count(),
                'fieldActivities' => FieldActivity::query()->count(),
                'offlineSales' => OfflineSale::query()->count(),
                'examinations' => Examination::query()->count(),
            ],
            'recent' => [
                'orders' => Order::query()->latest()->limit(5)->get(),
                'bookings' => Booking::query()->with(['customerProfile', 'service'])->latest()->limit(5)->get(),
                'leads' => Lead::query()->with(['leadSource', 'assignedStaff', 'customerProfile'])->latest()->limit(5)->get(),
                'offlineSales' => OfflineSale::query()->with(['customerProfile', 'fieldStaff', 'event'])->latest()->limit(5)->get(),
            ],
            'lowStockProducts' => Product::query()
                ->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
                ->orderBy('stock_quantity')
                ->get(['id', 'name', 'slug', 'stock_quantity', 'low_stock_threshold']),
        ]);
    }
}
