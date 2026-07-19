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
use App\Models\Branch;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use App\Services\OfflineSaleService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Barryvdh\DomPDF\Facade\Pdf;

class OfflineSaleController extends Controller
{
    private function authorizeAdmin(): User
    {
        $user = request()->user();

        abort_unless($user !== null && $user->isAdmin(), 403);

        return $user;
    }

    private function ensureOfflineSaleInScope(User $actor, OfflineSale $offlineSale): void
    {
        $actor->ensureCanAccessBranch(
            $offlineSale->branch_id !== null ? (int) $offlineSale->branch_id : null,
            'Akses ditolak: Data penjualan ini bukan milik cabang Anda.'
        );
    }

    private function branchesForActor(User $actor)
    {
        $forcedBranchId = $actor->forcedBranchId();

        if ($forcedBranchId) {
            return Branch::query()->where('id', $forcedBranchId)->where('is_active', true)->orderBy('name')->get(['id', 'name']);
        }

        return Branch::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']);
    }

    /**
     * Admin cabang: selalu cabangnya.
     * Admin pusat: boleh filter branch_id dari request (null = semua cabang).
     */
    private function resolveBranchId(User $user, mixed $requestedBranchId): ?int
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

    private function applyOptionalBranchFilter($query, ?int $branchId, string $column = 'branch_id'): void
    {
        if ($branchId !== null) {
            $query->where($column, $branchId);
        }
    }

    public function index(): Response
    {
        $user = $this->authorizeAdmin();

        $startDate = request('start_date');
        $endDate = request('end_date');
        $branchId = $this->resolveBranchId($user, request('branch_id'));
        $search = request('search');
        $perPage = request('per_page', 10);

        $metricsQuery = $user->applyBranchScope(OfflineSale::query());
        $this->applyOptionalBranchFilter($metricsQuery, $branchId);

        $historyQuery = $user->applyBranchScope(OfflineSale::query());
        $this->applyOptionalBranchFilter($historyQuery, $branchId);

        if ($startDate) {
            $historyQuery->whereDate('sold_at', '>=', $startDate);
        }

        if ($endDate) {
            $historyQuery->whereDate('sold_at', '<=', $endDate);
        }

        $totalRevenue = (clone $historyQuery)->sum('total');
        $totalTransactions = (clone $historyQuery)->count();
        $averageTransaction = $totalTransactions > 0 ? $totalRevenue / $totalTransactions : 0;
        $convertedLeadTransactions = (clone $historyQuery)->whereNotNull('lead_id')->count();

        $totalLeadsQuery = $user->applyBranchScope(Lead::query());
        $this->applyOptionalBranchFilter($totalLeadsQuery, $branchId);

        if ($startDate) {
            $totalLeadsQuery->whereDate('created_at', '>=', $startDate);
        }

        if ($endDate) {
            $totalLeadsQuery->whereDate('created_at', '<=', $endDate);
        }

        $totalLeads = $totalLeadsQuery->count();
        $leadConversionRate = $totalLeads > 0 ? ($convertedLeadTransactions / $totalLeads) * 100 : 0;

        $bestSellingProduct = \App\Models\OfflineSaleItem::query()
            ->whereHas('offlineSale', function ($query) use ($user, $startDate, $endDate, $branchId) {
                $user->applyBranchScope($query);
                $this->applyOptionalBranchFilter($query, $branchId);

                if ($startDate) {
                    $query->whereDate('sold_at', '>=', $startDate);
                }

                if ($endDate) {
                    $query->whereDate('sold_at', '<=', $endDate);
                }
            })
            ->whereNotNull('product_id')
            ->selectRaw('product_id, SUM(quantity) as total_qty')
            ->groupBy('product_id')
            ->orderByDesc('total_qty')
            ->with('product:id,name')
            ->first();

        $revenuePerSource = (clone $historyQuery)
            ->selectRaw('source, SUM(total) as revenue')
            ->groupBy('source')
            ->get();

        $staffRanking = (clone $historyQuery)
            ->whereNotNull('field_staff_id')
            ->selectRaw('field_staff_id, SUM(total) as revenue, COUNT(id) as transactions')
            ->groupBy('field_staff_id')
            ->orderByDesc('revenue')
            ->with('fieldStaff:id,name')
            ->get();

        $revenueTrend = (clone $historyQuery)
            ->selectRaw('DATE(sold_at) as sale_date, SUM(total) as revenue, COUNT(id) as transactions')
            ->groupBy('sale_date')
            ->orderBy('sale_date')
            ->get();

        $fieldStaffQuery = User::query()
            ->where('role', 'field_staff')
            ->where('is_active', true)
            ->orderBy('name');
        $user->applyBranchScope($fieldStaffQuery);

        $leadsQuery = $user->applyBranchScope(
            Lead::query()->with(['leadSource', 'assignedStaff', 'customerProfile', 'event'])->latest()
        );
        $eventsQuery = $user->applyBranchScope(Event::query()->latest());

        $offlineSalesQuery = $user->applyBranchScope(
            OfflineSale::query()
                ->with(['customerProfile', 'lead', 'fieldStaff', 'event', 'paymentMethod', 'voucherRedemption.voucher', 'branch'])
        );
        $this->applyOptionalBranchFilter($offlineSalesQuery, $branchId);

        if ($search) {
            $offlineSalesQuery->where(function ($query) use ($search) {
                $query->where('customer_name', 'ILIKE', "%{$search}%")
                    ->orWhere('sale_number', 'ILIKE', "%{$search}%")
                    ->orWhereHas('fieldStaff', function ($query) use ($search) {
                        $query->where('name', 'ILIKE', "%{$search}%");
                    })
                    ->orWhereHas('lead', function ($query) use ($search) {
                        $query->where('name', 'ILIKE', "%{$search}%");
                    })
                    ->orWhereHas('event', function ($query) use ($search) {
                        $query->where('name', 'ILIKE', "%{$search}%");
                    });
            });
        }

        if ($startDate) {
            $offlineSalesQuery->whereDate('sold_at', '>=', $startDate);
        }

        if ($endDate) {
            $offlineSalesQuery->whereDate('sold_at', '<=', $endDate);
        }

        return Inertia::render('Admin/OfflineSales/Index', [
            'metrics' => [
                'total' => (clone $metricsQuery)->count(),
                'revenue' => (clone $metricsQuery)->sum('total'),
                'events' => (clone $metricsQuery)->where('source', 'event')->count(),
                'doorToDoor' => (clone $metricsQuery)->where('source', 'door_to_door')->count(),
            ],
            'historyMetrics' => [
                'total_revenue' => $totalRevenue,
                'total_transactions' => $totalTransactions,
                'average_transaction' => $averageTransaction,
                'best_selling_product' => $bestSellingProduct,
                'converted_lead_transactions' => $convertedLeadTransactions,
                'total_leads' => $totalLeads,
                'lead_conversion_rate' => $leadConversionRate,
                'revenue_trend' => $revenueTrend,
                'events' => (clone $historyQuery)->where('source', 'event')->count(),
                'door_to_door' => (clone $historyQuery)->where('source', 'door_to_door')->count(),
                'revenue_per_source' => $revenuePerSource,
                'staff_ranking' => $staffRanking,
            ],
            'offlineSales' => $offlineSalesQuery
                ->latest()
                ->paginate($perPage)
                ->withQueryString(),
            'filters' => [
                'search' => $search,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'branch_id' => $branchId,
                'per_page' => $perPage,
            ],
            'products' => Product::query()->with('branchStocks')->where('is_active', true)->orderBy('name')->get(),
            'branches' => $this->branchesForActor($user),
            'services' => Service::query()->where('is_active', true)->orderBy('name')->get(),
            'customerProfiles' => CustomerProfile::query()->visibleToAdmin($user)->orderBy('name')->get(),
            'leads' => $leadsQuery->get(),
            'fieldStaff' => $fieldStaffQuery->get(['id', 'name', 'email', 'role', 'is_active', 'branch_id']),
            'events' => $eventsQuery->get(),
            'sources' => ['offline', 'door_to_door', 'event'],
            'paymentMethods' => PaymentMethod::query()->where('is_active', true)->orderBy('bank_name')->get(),
            'defaultBranchId' => $user->forcedBranchId(),
            'recentSale' => session('recentSale'),
        ]);
    }


    public function validateVoucher(Request $request, OfflineSaleService $offlineSaleService): JsonResponse
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'voucher_code' => ['required', 'string', 'max:255'],
            'customer_profile_id' => ['nullable', 'exists:customer_profiles,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['nullable', 'exists:products,id'],
            'items.*.service_id' => ['nullable', 'exists:services,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $subtotal = collect($validated['items'])->sum(function (array $item): float {
            $quantity = (int) $item['quantity'];

            if (! empty($item['product_id'])) {
                $product = Product::query()->whereKey($item['product_id'])->where('is_active', true)->first();

                if ($product === null) {
                    throw ValidationException::withMessages([
                        'items' => 'Produk tidak valid atau sudah tidak aktif.',
                    ]);
                }

                return (float) $product->price * $quantity;
            }

            if (! empty($item['service_id'])) {
                $service = Service::query()->whereKey($item['service_id'])->where('is_active', true)->first();

                if ($service === null) {
                    throw ValidationException::withMessages([
                        'items' => 'Layanan tidak valid atau sudah tidak aktif.',
                    ]);
                }

                return (float) ($service->price ?? 0) * $quantity;
            }

            throw ValidationException::withMessages([
                'items' => 'Item harus memiliki produk atau layanan.',
            ]);
        });

        try {
            [$voucher, $discountAmount] = $offlineSaleService->previewVoucher($validated, $validated['voucher_code'], $subtotal);
        } catch (ValidationException $exception) {
            return response()->json([
                'valid' => false,
                'message' => collect($exception->errors())->flatten()->first() ?? 'Voucher tidak valid.',
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'valid' => true,
            'voucher' => [
                'id' => $voucher->id,
                'code' => $voucher->code,
                'name' => $voucher->name,
                'discount_type' => $voucher->discount_type,
                'discount_value' => $voucher->discount_value,
            ],
            'subtotal' => $subtotal,
            'discount_amount' => $discountAmount,
            'total' => $subtotal - $discountAmount,
            'message' => 'Voucher valid dan dapat digunakan.',
        ]);
    }

    public function store(StoreOfflineSaleRequest $request, OfflineSaleService $offlineSaleService): RedirectResponse
    {
        $this->authorizeAdmin();

        $offlineSale = $offlineSaleService->create($request->validated());

        return redirect()->route('admin.offline-sales.index')->with([
            'success' => 'Penjualan offline berhasil ditambahkan.',
            'recentSale' => $offlineSale,
        ]);
    }

    public function show(OfflineSale $offlineSale): Response
    {
        $user = $this->authorizeAdmin();
        $this->ensureOfflineSaleInScope($user, $offlineSale);

        $offlineSale->load(['offlineSaleItems.product', 'offlineSaleItems.service', 'customerProfile', 'lead', 'fieldStaff', 'event', 'paymentMethod', 'voucherRedemption.voucher', 'branch']);

        return Inertia::render('Admin/OfflineSales/Show', [
            'offlineSale' => $offlineSale,
        ]);
    }

    public function print(OfflineSale $offlineSale)
    {
        $user = $this->authorizeAdmin();
        $this->ensureOfflineSaleInScope($user, $offlineSale);

        $offlineSale->load(['offlineSaleItems.product', 'offlineSaleItems.service', 'paymentMethod', 'voucherRedemption.voucher']);

        return view('admin.offline_sales.print', [
            'sale' => $offlineSale,
        ]);
    }

    public function invoice(OfflineSale $offlineSale)
    {
        $user = $this->authorizeAdmin();
        $this->ensureOfflineSaleInScope($user, $offlineSale);

        $offlineSale->load([
            'offlineSaleItems.product',
            'offlineSaleItems.service',
            'customerProfile',
            'fieldStaff',
            'paymentMethod',
        ]);

        $pdf = Pdf::loadView('admin.offline_sales.invoice', [
            'sale' => $offlineSale,
        ]);

        return $pdf->stream('Invoice-Offline-'.$offlineSale->sale_number.'.pdf');
    }
}
