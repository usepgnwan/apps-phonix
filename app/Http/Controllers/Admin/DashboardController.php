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

    private function getTrendData($modelClass, $startDate, $endDate)
    {
        $start = $startDate ? \Carbon\Carbon::parse($startDate)->startOfDay() : now()->startOfMonth();
        $end = $endDate ? \Carbon\Carbon::parse($endDate)->endOfDay() : now()->endOfMonth();
        
        $days = $start->diffInDays($end) + 1;
        // Limit to 30 days for trend visual to prevent massive arrays if they select a huge range
        if ($days > 31) {
            $days = 31;
            $start = $end->copy()->subDays($days - 1)->startOfDay();
        }

        $data = $modelClass::query()
            ->where('created_at', '>=', $start)
            ->where('created_at', '<=', $end)
            ->selectRaw('DATE(created_at) as date, count(*) as count')
            ->groupBy('date')
            ->pluck('count', 'date');

        $trend = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $dateStr = $end->copy()->subDays($i)->format('Y-m-d');
            $displayDate = $end->copy()->subDays($i)->isoFormat('D MMM YYYY');
            $trend[] = [
                'date' => $displayDate,
                'value' => (float) ($data[$dateStr] ?? 0)
            ];
        }
        
        return $trend;
    }

    public function index(): Response
    {
        $this->authorizeAdmin();

        $startDate = request('start_date', now()->startOfMonth()->format('Y-m-d'));
        $endDate = request('end_date', now()->endOfMonth()->format('Y-m-d'));

        $applyRange = function ($query) use ($startDate, $endDate) {
            if ($startDate) {
                $query->where('created_at', '>=', $startDate . ' 00:00:00');
            }
            if ($endDate) {
                $query->where('created_at', '<=', $endDate . ' 23:59:59');
            }
            return $query;
        };

        return Inertia::render('Admin/Dashboard/Index', [
            'page' => 'admin.dashboard.index',
            'filters' => ['start_date' => $startDate, 'end_date' => $endDate],
            'summary' => [
                'productsAndServices' => $applyRange(Product::query())->count() + $applyRange(Service::query())->count(),
                'ordersRevenue' => $applyRange(Order::query())->sum('total'),
                'bookings' => $applyRange(Booking::query())->count(),
                'leads' => $applyRange(Lead::query())->count(),
                'customerProfiles' => $applyRange(CustomerProfile::query())->count(),
                'fieldActivities' => $applyRange(FieldActivity::query())->count(),
                'offlineSales' => $applyRange(OfflineSale::query())->count(),
                'examinations' => $applyRange(Examination::query())->count(),
            ],
            'trends' => [
                'productsAndServices' => $this->getTrendData(Product::class, $startDate, $endDate),
                'ordersRevenue' => $this->getTrendData(Order::class, $startDate, $endDate),
                'bookings' => $this->getTrendData(Booking::class, $startDate, $endDate),
                'leads' => $this->getTrendData(Lead::class, $startDate, $endDate),
                'customerProfiles' => $this->getTrendData(CustomerProfile::class, $startDate, $endDate),
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
