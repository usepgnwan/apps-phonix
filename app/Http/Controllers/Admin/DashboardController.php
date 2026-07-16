<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BranchProductStock;
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

        abort_unless($user !== null && $user->isAdmin(), 403);
    }

    private function getTrendData($modelClass, $startDate, $endDate, $branchId = null, $branchCol = 'branch_id')
    {
        $start = $startDate ? \Carbon\Carbon::parse($startDate)->startOfDay() : now()->startOfMonth();
        $end = $endDate ? \Carbon\Carbon::parse($endDate)->endOfDay() : now()->endOfMonth();
        
        $days = $start->diffInDays($end) + 1;
        // Limit to 30 days for trend visual to prevent massive arrays if they select a huge range
        if ($days > 31) {
            $days = 31;
            $start = $end->copy()->subDays($days - 1)->startOfDay();
        }

        $query = $modelClass::query()
            ->where('created_at', '>=', $start)
            ->where('created_at', '<=', $end);

        if ($branchId && in_array($modelClass, [\App\Models\Order::class, \App\Models\Booking::class, \App\Models\OfflineSale::class, \App\Models\Lead::class, \App\Models\Event::class])) {
            $query->where($branchCol, $branchId);
        }

        $data = $query->selectRaw('DATE(created_at) as date, count(*) as count')
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

    public function index(\Illuminate\Http\Request $request): Response
    {
        $this->authorizeAdmin();

        $user = $request->user();
        $startDate = request('start_date', now()->startOfMonth()->format('Y-m-d'));
        $endDate = request('end_date', now()->endOfMonth()->format('Y-m-d'));
        
        $branchId = $user->forcedBranchId();
        if ($branchId === null && $user->isAdminPusat() && $request->filled('branch_id')) {
            $branchId = (int) $request->input('branch_id');
        }

        $applyRange = function ($query) use ($startDate, $endDate) {
            if ($startDate) {
                $query->where('created_at', '>=', $startDate . ' 00:00:00');
            }
            if ($endDate) {
                $query->where('created_at', '<=', $endDate . ' 23:59:59');
            }
            return $query;
        };

        $applyBranch = function ($query, $col = 'branch_id') use ($user, $branchId) {
            if ($branchId) {
                $query->where($col, $branchId);
            } else {
                $user->applyBranchScope($query, $col);
            }

            return $query;
        };

        $lowStockQuery = BranchProductStock::query()
            ->with(['product:id,name,slug', 'branch:id,name'])
            ->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
            ->orderBy('stock_quantity');
            
        if ($branchId) {
            $lowStockQuery->where('branch_id', $branchId);
        }

        return Inertia::render('Admin/Dashboard/Index', [
            'page' => 'admin.dashboard.index',
            'filters' => [
                'start_date' => $startDate, 
                'end_date' => $endDate, 
                'branch_id' => $branchId
            ],
            'branches' => $user->isAdminPusat() ? \App\Models\Branch::query()->where('is_active', true)->get(['id', 'name']) : [],
            'summary' => [
                'productsAndServices' => $applyRange(Product::query())->count() + $applyRange(Service::query())->count(),
                'ordersRevenue' => $applyBranch($applyRange(Order::query()))->sum('total'),
                'bookings' => $applyBranch($applyRange(Booking::query()))->count(),
                'leads' => $applyBranch($applyRange(Lead::query()))->count(),
                'customerProfiles' => $applyRange(CustomerProfile::query())->count(),
                'fieldActivities' => $applyRange(FieldActivity::query())->count(), 
                'offlineSales' => $applyBranch($applyRange(OfflineSale::query()))->count(),
                'examinations' => $applyRange(Examination::query())->count(),
            ],
            'trends' => [
                'productsAndServices' => $this->getTrendData(Product::class, $startDate, $endDate),
                'ordersRevenue' => $this->getTrendData(Order::class, $startDate, $endDate, $branchId),
                'bookings' => $this->getTrendData(Booking::class, $startDate, $endDate, $branchId),
                'leads' => $this->getTrendData(Lead::class, $startDate, $endDate, $branchId),
                'customerProfiles' => $this->getTrendData(CustomerProfile::class, $startDate, $endDate),
            ],
            'recent' => [
                'orders' => $applyBranch(Order::query())->with('branch:id,name')->latest()->limit(5)->get(),
                'bookings' => $applyBranch(Booking::query())->with(['customerProfile', 'service', 'branch:id,name'])->latest()->limit(5)->get(),
                'leads' => $applyBranch(Lead::query())->with(['leadSource', 'assignedStaff', 'customerProfile'])->latest()->limit(5)->get(),
                'offlineSales' => $applyBranch(OfflineSale::query())->with(['customerProfile', 'fieldStaff', 'event', 'branch:id,name'])->latest()->limit(5)->get(),
            ],
            'lowStockProducts' => $lowStockQuery->get(),
        ]);
    }
}
