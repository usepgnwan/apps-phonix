<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\FieldActivity;
use App\Models\Lead;
use App\Models\OfflineSale;
use App\Models\Order;
use App\Models\ProductRecommendation;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use ZipArchive;

class ReportController extends Controller
{
    private function authorizeAdmin(): void
    {
        $user = request()->user();

        abort_unless($user !== null && $user->role === 'admin' && $user->is_active, 403);
    }

    public function index(Request $request): Response
    {
        $this->authorizeAdmin();

        $period = $this->resolvePeriod($request);
        $reports = $this->buildReports($period);

        return Inertia::render('Admin/Reports/Index', [
            'page' => 'admin.reports.index',
            'filters' => $period,
            'reports' => $reports,
        ]);
    }

    public function exportXlsx(Request $request): StreamedResponse
    {
        $this->authorizeAdmin();

        $period = $this->resolvePeriod($request);
        $reports = $this->buildReports($period);
        $filename = 'laporan-phoenix-'.$period['start_date'].'-'.$period['end_date'].'.xlsx';

        return response()->streamDownload(function () use ($period, $reports): void {
            $path = $this->buildXlsxFile($this->reportRows($period, $reports));

            readfile($path);
            unlink($path);
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
    public function exportPdf(Request $request): HttpResponse
    {
        $this->authorizeAdmin();

        $period = $this->resolvePeriod($request);
        $reports = $this->buildReports($period);

        $pdf = app('dompdf.wrapper')->loadView('admin.reports.summary', [
            'period' => $period,
            'reports' => $reports,
        ]);

        return $pdf->stream('laporan-phoenix-'.$period['start_date'].'-'.$period['end_date'].'.pdf');
    }
    public function productSales(Request $request, \App\Models\Product $product)
    {
        $this->authorizeAdmin();

        $period = $this->resolvePeriod($request);
        $start = Carbon::parse($period['start_date'])->startOfDay();
        $end = Carbon::parse($period['end_date'])->endOfDay();

        $onlineSales = \Illuminate\Support\Facades\DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('order_items.product_id', $product->id)
            ->whereBetween('orders.created_at', [$start, $end])
            ->where(function ($query) {
                $query->where('orders.payment_status', 'paid')
                    ->orWhereIn('orders.status', ['payment_received', 'completed']);
            })
            ->selectRaw("
                'Online' as source,
                orders.order_number as reference,
                orders.created_at as date,
                order_items.quantity,
                order_items.line_total as total
            ");

        $offlineSales = \Illuminate\Support\Facades\DB::table('offline_sale_items')
            ->join('offline_sales', 'offline_sale_items.offline_sale_id', '=', 'offline_sales.id')
            ->where('offline_sale_items.product_id', $product->id)
            ->whereBetween('offline_sales.sold_at', [$start, $end])
            ->selectRaw("
                'Offline' as source,
                offline_sales.sale_number as reference,
                offline_sales.sold_at as date,
                offline_sale_items.quantity,
                offline_sale_items.line_total as total
            ");

        $transactions = $onlineSales->unionAll($offlineSales)
            ->orderByDesc('date')
            ->paginate($request->input('per_page', 10));

        return response()->json($transactions);
    }

    private function reportRows(array $period, array $reports): array
    {
        $kpiLabels = [
            'websiteOrderRevenue' => 'Pendapatan Order Website',
            'offlineSalesRevenue' => 'Pendapatan Penjualan Offline',
            'totalRevenue' => 'Total Pendapatan',
            'totalLeads' => 'Total Lead',
            'totalBookings' => 'Total Booking',
            'totalOrders' => 'Total Order',
            'totalFieldActivities' => 'Aktivitas Lapangan',
            'totalProductRecommendations' => 'Rekomendasi Produk',
        ];

        $segmentLabels = [
            'leadsBySource' => 'Lead Berdasarkan Sumber',
            'leadsByAssignedStaff' => 'Lead Berdasarkan Staff',
            'bookingsByService' => 'Booking Berdasarkan Layanan',
            'bookingsByStatus' => 'Booking Berdasarkan Status',
            'ordersByStatus' => 'Order Berdasarkan Status',
            'fieldActivitiesByType' => 'Aktivitas Lapangan Berdasarkan Jenis',
            'productRecommendationsByProduct' => 'Rekomendasi Produk Berdasarkan Produk',
            'productStockAndSales' => 'Stok & Penjualan Produk',
        ];

        $rows = [
            ['Laporan Phoenix Kantor Pusat'],
            ['Periode', $period['start_date'].' s/d '.$period['end_date']],
            [],
            ['KPI', 'Nilai'],
        ];

        foreach ($reports['kpis'] as $label => $value) {
            $rows[] = [$kpiLabels[$label] ?? $this->readableReportLabel($label), $value];
        }

        foreach ($reports['segments'] as $segmentName => $segmentRows) {
            $rows[] = [];
            $rows[] = [$segmentLabels[$segmentName] ?? $this->readableReportLabel($segmentName)];
            $rows[] = ['Nama / Status', 'Keterangan', 'Total'];

            foreach ($segmentRows as $row) {
                $rows[] = [
                    $row['name'] ?? $this->readableReportLabel($row['status'] ?? $row['activityType'] ?? '-'),
                    $row['email'] ?? $row['slug'] ?? '',
                    $row['total'] ?? 0,
                ];
            }
        }

        return $rows;
    }

    private function readableReportLabel(string $label): string
    {
        $label = preg_replace('/(?<!^)[A-Z]/', ' $0', $label) ?? $label;

        return ucwords(str_replace(['_', '-'], ' ', $label));
    }

    private function buildXlsxFile(array $rows): string
    {
        $path = tempnam(sys_get_temp_dir(), 'phoenix-report-');
        $zip = new ZipArchive();
        $zip->open($path, ZipArchive::OVERWRITE);
        $zip->addFromString('[Content_Types].xml', $this->xlsxContentTypes());
        $zip->addFromString('_rels/.rels', $this->xlsxRootRels());
        $zip->addFromString('xl/workbook.xml', $this->xlsxWorkbook());
        $zip->addFromString('xl/_rels/workbook.xml.rels', $this->xlsxWorkbookRels());
        $zip->addFromString('xl/styles.xml', $this->xlsxStyles());
        $zip->addFromString('xl/worksheets/sheet1.xml', $this->xlsxWorksheet($rows));
        $zip->close();

        return $path;
    }

    private function xlsxWorksheet(array $rows): string
    {
        $columns = $this->xlsxColumns($rows);
        $sheetRows = collect($rows)
            ->map(function (array $row, int $rowIndex): string {
                $style = $this->xlsxRowStyle($row, $rowIndex);
                $cells = collect($row)
                    ->map(fn ($value, int $columnIndex): string => $this->xlsxCell($value, $columnIndex + 1, $rowIndex + 1, $style))
                    ->implode('');

                return '<row r="'.($rowIndex + 1).'">'.$cells.'</row>';
            })
            ->implode('');

        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            .$columns
            .'<sheetData>'.$sheetRows.'</sheetData>'
            .'</worksheet>';
    }

    private function xlsxColumns(array $rows): string
    {
        $widths = [];

        foreach ($rows as $row) {
            foreach ($row as $index => $value) {
                $length = mb_strlen((string) $value);
                $widths[$index] = max($widths[$index] ?? 0, min(max($length + 4, 12), 60));
            }
        }

        if ($widths === []) {
            return '';
        }

        $columns = collect($widths)
            ->map(fn (int $width, int $index): string => '<col min="'.($index + 1).'" max="'.($index + 1).'" width="'.$width.'" customWidth="1"/>')
            ->implode('');

        return '<cols>'.$columns.'</cols>';
    }

    private function xlsxRowStyle(array $row, int $rowIndex): int
    {
        if ($rowIndex === 0 || count($row) === 1) {
            return 1;
        }

        if ($row === ['KPI', 'Nilai'] || $row === ['Nama / Status', 'Keterangan', 'Total']) {
            return 2;
        }

        return 3;
    }

    private function xlsxCell(mixed $value, int $column, int $row, int $style): string
    {
        $cell = $this->xlsxColumn($column).$row;
        $styleAttribute = ' s="'.$style.'"';

        if (is_numeric($value)) {
            return '<c r="'.$cell.'"'.$styleAttribute.'><v>'.$value.'</v></c>';
        }

        return '<c r="'.$cell.'" t="inlineStr"'.$styleAttribute.'><is><t>'.htmlspecialchars((string) $value, ENT_XML1).'</t></is></c>';
    }

    private function xlsxColumn(int $column): string
    {
        $name = '';

        while ($column > 0) {
            $column--;
            $name = chr(65 + ($column % 26)).$name;
            $column = intdiv($column, 26);
        }

        return $name;
    }

    private function xlsxContentTypes(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            .'<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            .'<Default Extension="xml" ContentType="application/xml"/>'
            .'<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            .'<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            .'<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
            .'</Types>';
    }

    private function xlsxRootRels(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            .'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
            .'</Relationships>';
    }

    private function xlsxWorkbook(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            .'<sheets><sheet name="Laporan" sheetId="1" r:id="rId1"/></sheets>'
            .'</workbook>';
    }

    private function xlsxWorkbookRels(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            .'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
            .'<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
            .'</Relationships>';
    }

    private function xlsxStyles(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            .'<fonts count="2">'
            .'<font><sz val="11"/><name val="Calibri"/></font>'
            .'<font><b/><sz val="11"/><name val="Calibri"/><color rgb="FFFFFFFF"/></font>'
            .'</fonts>'
            .'<fills count="3">'
            .'<fill><patternFill patternType="none"/></fill>'
            .'<fill><patternFill patternType="gray125"/></fill>'
            .'<fill><patternFill patternType="solid"><fgColor rgb="FF1E4D3A"/><bgColor indexed="64"/></patternFill></fill>'
            .'</fills>'
            .'<borders count="2">'
            .'<border><left/><right/><top/><bottom/><diagonal/></border>'
            .'<border><left style="thin"><color rgb="FFD9E2DD"/></left><right style="thin"><color rgb="FFD9E2DD"/></right><top style="thin"><color rgb="FFD9E2DD"/></top><bottom style="thin"><color rgb="FFD9E2DD"/></bottom><diagonal/></border>'
            .'</borders>'
            .'<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
            .'<cellXfs count="4">'
            .'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
            .'<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>'
            .'<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>'
            .'<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/>'
            .'</cellXfs>'
            .'</styleSheet>';
    }

    private function resolvePeriod(Request $request): array
    {
        $preset = $request->input('period', 'month');
        $today = now();

        [$start, $end] = match ($preset) {
            'today' => [$today->copy()->startOfDay(), $today->copy()->endOfDay()],
            'last_7_days' => [$today->copy()->subDays(6)->startOfDay(), $today->copy()->endOfDay()],
            'year' => [$today->copy()->startOfYear(), $today->copy()->endOfYear()],
            'custom' => [
                Carbon::parse($request->input('start_date', $today->copy()->startOfMonth()->toDateString()))->startOfDay(),
                Carbon::parse($request->input('end_date', $today->copy()->endOfMonth()->toDateString()))->endOfDay(),
            ],
            default => [$today->copy()->startOfMonth(), $today->copy()->endOfMonth()],
        };

        if ($start->greaterThan($end)) {
            [$start, $end] = [$end->copy()->startOfDay(), $start->copy()->endOfDay()];
        }

        return [
            'period' => $preset,
            'start_date' => $start->toDateString(),
            'end_date' => $end->toDateString(),
        ];
    }

    private function buildReports(array $period): array
    {
        $start = Carbon::parse($period['start_date'])->startOfDay();
        $end = Carbon::parse($period['end_date'])->endOfDay();

        $segments = [
            'leadsBySource' => $this->leadsBySource($start, $end),
            'leadsByAssignedStaff' => $this->leadsByAssignedStaff($start, $end),
            'bookingsByService' => $this->bookingsByService($start, $end),
            'bookingsByStatus' => $this->bookingsByStatus($start, $end),
            'ordersByStatus' => $this->ordersByStatus($start, $end),
            'fieldActivitiesByType' => $this->fieldActivitiesByType($start, $end),
            'productRecommendationsByProduct' => $this->productRecommendationsByProduct($start, $end),
            'productStockAndSales' => $this->productStockAndSales($start, $end),
        ];

        $websiteOrderRevenue = $this->paidOrders($start, $end)->sum('total');
        $offlineSalesRevenue = $this->between(OfflineSale::query(), $start, $end, 'sold_at')->sum('total');

        return [
            'kpis' => [
                'websiteOrderRevenue' => (float) $websiteOrderRevenue,
                'offlineSalesRevenue' => (float) $offlineSalesRevenue,
                'totalRevenue' => (float) $websiteOrderRevenue + (float) $offlineSalesRevenue,
                'totalLeads' => $this->between(Lead::query(), $start, $end)->count(),
                'totalBookings' => $this->between(Booking::query(), $start, $end)->count(),
                'totalOrders' => $this->between(Order::query(), $start, $end)->count(),
                'totalFieldActivities' => $this->between(FieldActivity::query(), $start, $end, 'activity_at')->count(),
                'totalProductRecommendations' => $this->between(ProductRecommendation::query(), $start, $end)->count(),
            ],
            'segments' => $segments,
            'charts' => [
                'revenueSplit' => [
                    ['name' => 'Order Website', 'value' => (float) $websiteOrderRevenue],
                    ['name' => 'Penjualan Offline', 'value' => (float) $offlineSalesRevenue],
                ],
                'trends' => $this->trends($start, $end),
            ],
            ...$segments,
            'websiteOrderRevenue' => (float) $websiteOrderRevenue,
            'offlineSalesRevenue' => (float) $offlineSalesRevenue,
        ];
    }

    private function between(Builder $query, Carbon $start, Carbon $end, string $column = 'created_at'): Builder
    {
        return $query->whereBetween($column, [$start, $end]);
    }

    private function paidOrders(Carbon $start, Carbon $end): Builder
    {
        return $this->between(Order::query(), $start, $end)
            ->where(function (Builder $query): void {
                $query->where('payment_status', 'paid')
                    ->orWhere('status', 'payment_received')
                    ->orWhere('status', 'completed');
            });
    }

    private function leadsBySource(Carbon $start, Carbon $end)
    {
        return $this->between(Lead::query(), $start, $end)
            ->selectRaw('lead_source_id, COUNT(*) as total')
            ->with('leadSource:id,name')
            ->groupBy('lead_source_id')
            ->orderByDesc('total')
            ->get()
            ->map(fn (Lead $lead): array => [
                'id' => $lead->lead_source_id,
                'name' => $lead->leadSource?->name ?? 'Tanpa sumber',
                'total' => (int) $lead->total,
            ]);
    }

    private function leadsByAssignedStaff(Carbon $start, Carbon $end)
    {
        return $this->between(Lead::query(), $start, $end)
            ->selectRaw('assigned_staff_id, COUNT(*) as total')
            ->with('assignedStaff:id,name,email')
            ->groupBy('assigned_staff_id')
            ->orderByDesc('total')
            ->get()
            ->map(fn (Lead $lead): array => [
                'id' => $lead->assigned_staff_id,
                'name' => $lead->assignedStaff?->name ?? 'Belum ditugaskan',
                'email' => $lead->assignedStaff?->email,
                'total' => (int) $lead->total,
            ]);
    }

    private function bookingsByService(Carbon $start, Carbon $end)
    {
        return $this->between(Booking::query(), $start, $end)
            ->selectRaw('service_id, COUNT(*) as total')
            ->with('service:id,name')
            ->groupBy('service_id')
            ->orderByDesc('total')
            ->get()
            ->map(fn (Booking $booking): array => [
                'id' => $booking->service_id,
                'name' => $booking->service?->name ?? 'Tanpa layanan',
                'total' => (int) $booking->total,
            ]);
    }

    private function bookingsByStatus(Carbon $start, Carbon $end)
    {
        return $this->between(Booking::query(), $start, $end)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->orderBy('status')
            ->get()
            ->map(fn (Booking $booking): array => [
                'status' => $booking->status,
                'total' => (int) $booking->total,
            ]);
    }

    private function ordersByStatus(Carbon $start, Carbon $end)
    {
        return $this->between(Order::query(), $start, $end)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->orderBy('status')
            ->get()
            ->map(fn (Order $order): array => [
                'status' => $order->status,
                'total' => (int) $order->total,
            ]);
    }

    private function fieldActivitiesByType(Carbon $start, Carbon $end)
    {
        return $this->between(FieldActivity::query(), $start, $end, 'activity_at')
            ->selectRaw('activity_type, COUNT(*) as total')
            ->groupBy('activity_type')
            ->orderBy('activity_type')
            ->get()
            ->map(fn (FieldActivity $fieldActivity): array => [
                'activityType' => $fieldActivity->activity_type,
                'total' => (int) $fieldActivity->total,
            ]);
    }

    private function productRecommendationsByProduct(Carbon $start, Carbon $end)
    {
        return $this->between(ProductRecommendation::query(), $start, $end)
            ->selectRaw('product_id, COUNT(*) as total')
            ->with('product:id,name,slug')
            ->groupBy('product_id')
            ->orderByDesc('total')
            ->get()
            ->map(fn (ProductRecommendation $recommendation): array => [
                'id' => $recommendation->product_id,
                'name' => $recommendation->product?->name ?? 'Tanpa produk',
                'slug' => $recommendation->product?->slug,
                'total' => (int) $recommendation->total,
            ]);
    }

    private function productStockAndSales(Carbon $start, Carbon $end)
    {
        return \App\Models\Product::query()
            ->select('id', 'name', 'stock_quantity')
            ->get()
            ->map(function (\App\Models\Product $product) use ($start, $end): array {
                $onlineSales = \Illuminate\Support\Facades\DB::table('order_items')
                    ->join('orders', 'order_items.order_id', '=', 'orders.id')
                    ->where('order_items.product_id', $product->id)
                    ->whereBetween('orders.created_at', [$start, $end])
                    ->where(function ($query) {
                        $query->where('orders.payment_status', 'paid')
                            ->orWhereIn('orders.status', ['payment_received', 'completed']);
                    })
                    ->sum('order_items.quantity');

                $offlineSales = \Illuminate\Support\Facades\DB::table('offline_sale_items')
                    ->join('offline_sales', 'offline_sale_items.offline_sale_id', '=', 'offline_sales.id')
                    ->where('offline_sale_items.product_id', $product->id)
                    ->whereBetween('offline_sales.sold_at', [$start, $end])
                    ->sum('offline_sale_items.quantity');

                $totalSold = (int) ($onlineSales + $offlineSales);

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => 'Stok Tersedia: ' . number_format($product->stock_quantity, 0, ',', '.'),
                    'total' => $totalSold,
                ];
            })
            ->sortByDesc('total')
            ->values()
            ->all();
    }

    private function trends(Carbon $start, Carbon $end): array
    {
        $period = collect(CarbonPeriod::create($start->toDateString(), $end->toDateString()))
            ->map(fn (Carbon $date): string => $date->toDateString())
            ->values();

        if ($period->count() > 45) {
            $period = collect(CarbonPeriod::create($end->copy()->subDays(44)->toDateString(), $end->toDateString()))
                ->map(fn (Carbon $date): string => $date->toDateString())
                ->values();
        }

        $trendStart = Carbon::parse($period->first())->startOfDay();

        return [
            'websiteOrderRevenue' => $this->sumTrend($this->paidOrders($trendStart, $end), $period, 'total'),
            'offlineSalesRevenue' => $this->sumTrend($this->between(OfflineSale::query(), $trendStart, $end, 'sold_at'), $period, 'total', 'sold_at'),
            'leads' => $this->countTrend($this->between(Lead::query(), $trendStart, $end), $period),
            'bookings' => $this->countTrend($this->between(Booking::query(), $trendStart, $end), $period),
            'orders' => $this->countTrend($this->between(Order::query(), $trendStart, $end), $period),
        ];
    }

    private function countTrend(Builder $query, Collection $period, string $dateColumn = 'created_at'): array
    {
        $rows = $query->selectRaw('DATE('.$dateColumn.') as date, COUNT(*) as total')
            ->groupBy('date')
            ->pluck('total', 'date');

        return $period->map(fn (string $date): array => [
            'date' => Carbon::parse($date)->isoFormat('D MMM'),
            'value' => (int) ($rows[$date] ?? 0),
        ])->all();
    }

    private function sumTrend(Builder $query, Collection $period, string $sumColumn, string $dateColumn = 'created_at'): array
    {
        $rows = $query->selectRaw('DATE('.$dateColumn.') as date, SUM('.$sumColumn.') as total')
            ->groupBy('date')
            ->pluck('total', 'date');

        return $period->map(fn (string $date): array => [
            'date' => Carbon::parse($date)->isoFormat('D MMM'),
            'value' => (float) ($rows[$date] ?? 0),
        ])->all();
    }
}
