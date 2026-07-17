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

    /**
     * Build sparkline trend points for a date range.
     *
     * Granularity adapts to the selected period:
     * - <= 45 days  → daily points (today, 7 days, month, short custom)
     * - > 45 days   → monthly points (year, long custom)
     */
    private function getTrendData($modelClass, $startDate, $endDate, $branchId = null, $branchCol = 'branch_id')
    {
        $start = $startDate ? \Carbon\Carbon::parse($startDate)->startOfDay() : now()->startOfMonth();
        $end = $endDate ? \Carbon\Carbon::parse($endDate)->endOfDay() : now()->endOfMonth();
        $days = (int) $start->diffInDays($end) + 1;
        $useMonthly = $days > 45;

        $query = $modelClass::query()
            ->where('created_at', '>=', $start)
            ->where('created_at', '<=', $end);

        if ($branchId && in_array($modelClass, [
            Order::class,
            Booking::class,
            OfflineSale::class,
            Lead::class,
            \App\Models\Event::class,
        ], true)) {
            $query->where($branchCol, $branchId);
        }

        $bucketExpression = $this->trendBucketExpression($useMonthly ? 'month' : 'day');

        $data = (clone $query)
            ->selectRaw("{$bucketExpression} as bucket, COUNT(*) as count")
            ->groupBy('bucket')
            ->pluck('count', 'bucket');

        $trend = [];

        if ($useMonthly) {
            $cursor = $start->copy()->startOfMonth();
            $lastMonth = $end->copy()->startOfMonth();

            while ($cursor->lessThanOrEqualTo($lastMonth)) {
                $bucket = $cursor->format('Y-m');
                $trend[] = [
                    'date' => $cursor->isoFormat('MMM YYYY'),
                    'value' => (float) ($data[$bucket] ?? 0),
                ];
                $cursor->addMonth();
            }

            return $trend;
        }

        $cursor = $start->copy()->startOfDay();
        $lastDay = $end->copy()->startOfDay();

        while ($cursor->lessThanOrEqualTo($lastDay)) {
            $bucket = $cursor->format('Y-m-d');
            $trend[] = [
                'date' => $cursor->isoFormat('D MMM YYYY'),
                'value' => (float) ($data[$bucket] ?? 0),
            ];
            $cursor->addDay();
        }

        return $trend;
    }

    /**
     * Portable SQL expression for grouping trend buckets (sqlite/mysql/pgsql).
     */
    private function trendBucketExpression(string $granularity): string
    {
        $driver = \Illuminate\Support\Facades\DB::connection()->getDriverName();

        if ($granularity === 'month') {
            return match ($driver) {
                'sqlite' => "strftime('%Y-%m', created_at)",
                'pgsql' => "to_char(created_at, 'YYYY-MM')",
                default => "DATE_FORMAT(created_at, '%Y-%m')",
            };
        }

        return match ($driver) {
            'sqlite' => "strftime('%Y-%m-%d', created_at)",
            'pgsql' => "to_char(created_at, 'YYYY-MM-DD')",
            default => 'DATE(created_at)',
        };
    }

    private function resolvePeriod(\Illuminate\Http\Request $request): array
    {
        $preset = $request->input('period', 'month');
        $today = now();

        [$start, $end] = match ($preset) {
            'today' => [$today->copy()->startOfDay(), $today->copy()->endOfDay()],
            'last_7_days' => [$today->copy()->subDays(6)->startOfDay(), $today->copy()->endOfDay()],
            'year' => [$today->copy()->startOfYear(), $today->copy()->endOfYear()],
            'custom' => [
                \Carbon\Carbon::parse($request->input('start_date', $today->copy()->startOfMonth()->toDateString()))->startOfDay(),
                \Carbon\Carbon::parse($request->input('end_date', $today->copy()->endOfMonth()->toDateString()))->endOfDay(),
            ],
            default => [$today->copy()->startOfMonth(), $today->copy()->endOfMonth()],
        };

        // Backward compatible: if no explicit period but dates are provided, treat as custom.
        if (! $request->filled('period') && ($request->filled('start_date') || $request->filled('end_date'))) {
            $preset = 'custom';
            $start = \Carbon\Carbon::parse($request->input('start_date', $today->copy()->startOfMonth()->toDateString()))->startOfDay();
            $end = \Carbon\Carbon::parse($request->input('end_date', $today->copy()->endOfMonth()->toDateString()))->endOfDay();
        }

        if ($start->greaterThan($end)) {
            [$start, $end] = [$end->copy()->startOfDay(), $start->copy()->endOfDay()];
        }

        return [
            'period' => $preset,
            'start_date' => $start->toDateString(),
            'end_date' => $end->toDateString(),
        ];
    }

    public function index(\Illuminate\Http\Request $request): Response
    {
        $this->authorizeAdmin();

        $user = $request->user();
        $period = $this->resolvePeriod($request);
        $startDate = $period['start_date'];
        $endDate = $period['end_date'];

        $branchId = $user->forcedBranchId();
        if ($branchId === null && $user->isAdminPusat() && $request->filled('branch_id')) {
            $branchId = (int) $request->input('branch_id');
        }

        $applyRange = function ($query) use ($startDate, $endDate) {
            if ($startDate) {
                $query->where('created_at', '>=', $startDate.' 00:00:00');
            }
            if ($endDate) {
                $query->where('created_at', '<=', $endDate.' 23:59:59');
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
            ->where('low_stock_threshold', '>', 0)
            ->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
            ->whereHas('branch')
            ->orderBy('stock_quantity');

        if ($branchId) {
            $lowStockQuery->where('branch_id', $branchId);
        }

        $fieldActivitiesQuery = FieldActivity::query();
        if ($branchId) {
            $fieldActivitiesQuery->whereHas('fieldStaff', fn ($q) => $q->where('branch_id', $branchId));
        } elseif ($user->isAdminCabang() && $user->branch_id) {
            $fieldActivitiesQuery->whereHas('fieldStaff', fn ($q) => $q->where('branch_id', (int) $user->branch_id));
        }

        return Inertia::render('Admin/Dashboard/Index', [
            'page' => 'admin.dashboard.index',
            'filters' => [
                'period' => $period['period'],
                'start_date' => $startDate,
                'end_date' => $endDate,
                'branch_id' => $branchId,
            ],
            'branches' => $user->isAdminPusat()
                ? \App\Models\Branch::query()->where('is_active', true)->orderBy('name')->get(['id', 'name'])
                : [],
            'summary' => [
                'productsAndServices' => Product::query()->count() + Service::query()->count(),
                'ordersRevenue' => $applyBranch($applyRange(Order::query()))->sum('total'),
                'bookings' => $applyBranch($applyRange(Booking::query()))->count(),
                'leads' => $applyBranch($applyRange(Lead::query()))->count(),
                'customerProfiles' => $applyRange(CustomerProfile::query())->count(),
                'fieldActivities' => $applyRange($fieldActivitiesQuery)->count(),
                'offlineSales' => $applyBranch($applyRange(OfflineSale::query()))->count(),
                'examinations' => $applyRange(Examination::query())->count(),
            ],
            'trends' => [
                'productsAndServices' => $this->getTrendData(Product::class, $startDate, $endDate),
                'ordersRevenue' => $this->getTrendData(Order::class, $startDate, $endDate, $branchId),
                'bookings' => $this->getTrendData(Booking::class, $startDate, $endDate, $branchId),
                'leads' => $this->getTrendData(Lead::class, $startDate, $endDate, $branchId),
                'customerProfiles' => $this->getTrendData(CustomerProfile::class, $startDate, $endDate),
                'offlineSales' => $this->getTrendData(OfflineSale::class, $startDate, $endDate, $branchId),
            ],
            'recent' => [
                'orders' => $applyBranch(Order::query())->with('branch:id,name')->latest()->limit(5)->get(),
                'bookings' => $applyBranch(Booking::query())->with(['customerProfile', 'service', 'branch:id,name'])->latest()->limit(5)->get(),
                'leads' => $applyBranch(Lead::query())->with(['leadSource', 'assignedStaff', 'customerProfile'])->latest()->limit(5)->get(),
                'offlineSales' => $applyBranch(OfflineSale::query())->with(['customerProfile', 'fieldStaff', 'event', 'branch:id,name'])->latest()->limit(5)->get(),
            ],
            'lowStockCount' => (clone $lowStockQuery)->count(),
            'lowStockProducts' => $lowStockQuery->limit(8)->get(),
        ]);
    }
}
