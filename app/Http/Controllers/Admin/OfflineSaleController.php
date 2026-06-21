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
    private function authorizeAdmin(): void
    {
        $user = request()->user();

        abort_unless($user !== null && $user->role === 'admin' && $user->is_active, 403);
    }

    public function index(): Response
    {
        $this->authorizeAdmin();

        $metricsQuery = OfflineSale::query();

        $startDate = request('start_date');
        $endDate = request('end_date');

        $historyQuery = OfflineSale::query()
            ->when($startDate && $endDate, function ($query) use ($startDate, $endDate) {
                $query->whereBetween('sold_at', [$startDate, $endDate]);
            });

        $totalRevenue = (clone $historyQuery)->sum('total');
        $totalTransactions = (clone $historyQuery)->count();
        $averageTransaction = $totalTransactions > 0 ? $totalRevenue / $totalTransactions : 0;
        $convertedLeadTransactions = (clone $historyQuery)->whereNotNull('lead_id')->count();
        $totalLeads = Lead::query()
            ->when($startDate && $endDate, function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            })
            ->count();
        $leadConversionRate = $totalLeads > 0 ? ($convertedLeadTransactions / $totalLeads) * 100 : 0;

        $bestSellingProduct = \App\Models\OfflineSaleItem::query()
            ->whereHas('offlineSale', function($query) use ($startDate, $endDate) {
                if ($startDate && $endDate) {
                    $query->whereBetween('sold_at', [$startDate, $endDate]);
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
            'offlineSales' => OfflineSale::query()
                ->with(['customerProfile', 'lead', 'fieldStaff', 'event', 'paymentMethod', 'voucherRedemption.voucher'])
                ->when(request('search'), function ($query, $search) {
                    $query->where(function ($query) use ($search) {
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
                })
                ->when($startDate && $endDate, function ($query) use ($startDate, $endDate) {
                    $query->whereBetween('sold_at', [$startDate, $endDate]);
                })
                ->latest()
                ->paginate(10)
                ->withQueryString(),
            'filters' => request()->only(['search', 'start_date', 'end_date']),
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
        $offlineSale = $offlineSaleService->create($request->validated());

        return redirect()->route('admin.offline-sales.index')->with([
            'success' => 'Penjualan offline berhasil ditambahkan.',
            'recentSale' => $offlineSale,
        ]);
    }

    public function show(OfflineSale $offlineSale): Response
    {
        $this->authorizeAdmin();

        $offlineSale->load(['offlineSaleItems.product', 'offlineSaleItems.service', 'customerProfile', 'lead', 'fieldStaff', 'event', 'paymentMethod', 'voucherRedemption.voucher']);

        return Inertia::render('Admin/OfflineSales/Show', [
            'offlineSale' => $offlineSale,
        ]);
    }

    public function print(OfflineSale $offlineSale)
    {
        $this->authorizeAdmin();

        $offlineSale->load(['offlineSaleItems.product', 'offlineSaleItems.service', 'paymentMethod', 'voucherRedemption.voucher']);

        return view('admin.offline_sales.print', [
            'sale' => $offlineSale,
        ]);
    }

    public function invoice(OfflineSale $offlineSale)
    {
        $this->authorizeAdmin();

        $offlineSale->load([
            'offlineSaleItems.product', 
            'offlineSaleItems.service', 
            'customerProfile', 
            'fieldStaff', 
            'paymentMethod'
        ]);

        $pdf = Pdf::loadView('admin.offline_sales.invoice', [
            'sale' => $offlineSale,
        ]);

        return $pdf->stream('Invoice-Offline-' . $offlineSale->sale_number . '.pdf');
    }
}
