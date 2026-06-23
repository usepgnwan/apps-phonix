<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateOrderPaymentRequest;
use App\Http\Requests\Admin\UpdateOrderShippingRequest;
use App\Http\Requests\Admin\UpdateOrderStatusRequest;
use App\Models\Order;
use App\Services\OrderFulfillmentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Collection;
use Symfony\Component\HttpFoundation\StreamedResponse;
use ZipArchive;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Barryvdh\DomPDF\Facade\Pdf;

class OrderController extends Controller
{
    private function authorizeAdmin(): void
    {
        $user = request()->user();

        abort_unless($user !== null && $user->role === 'admin' && $user->is_active, 403);
    }

    public function index(): Response
    {
        $this->authorizeAdmin();

        $search = request('search');
        $startDate = request('start_date');
        $endDate = request('end_date');

        $status = request('status');

        $query = Order::query()
            ->with(['user:id,name,email', 'customerProfile:id,user_id,name,whatsapp_number,primary_address', 'voucher:id,code,name', 'paymentMethod:id,type,bank_name,account_number,account_holder_name,qris_image_path,instructions,is_active']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'ILIKE', '%' . $search . '%')
                  ->orWhere('customer_name', 'ILIKE', '%' . $search . '%')
                  ->orWhereHas('customerProfile', function ($q2) use ($search) {
                      $q2->where('name', 'ILIKE', '%' . $search . '%');
                  })
                  ->orWhereHas('user', function ($q2) use ($search) {
                      $q2->where('name', 'ILIKE', '%' . $search . '%');
                  });
            });
        }

        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        if ($status && $status !== 'all') {
            if ($status === 'received') {
                $query->where(function($q) {
                    $q->where('status', 'payment_received')
                      ->orWhere('payment_status', 'paid');
                });
            } elseif ($status === 'shipped') {
                $query->where(function($q) {
                    $q->where('status', 'shipped')
                      ->orWhere('shipping_status', 'shipped');
                });
            } else {
                $query->where('status', $status);
            }
        }

        $perPage = request('per_page', 10);
        
        $orders = $query->latest()->paginate($perPage)->withQueryString();

        $allOrders = Order::select('status', 'payment_status', 'shipping_status')->get();
        $metrics = [
            'totalOrder' => $allOrders->count(),
            'waitingConfirmation' => $allOrders->where('status', 'pending')->count(),
            'received' => $allOrders->filter(fn($o) => $o->status === 'payment_received' || $o->payment_status === 'paid')->count(),
            'processing' => $allOrders->where('status', 'processing')->count(),
            'shipped' => $allOrders->filter(fn($o) => $o->status === 'shipped' || $o->shipping_status === 'shipped')->count(),
            'completed' => $allOrders->where('status', 'completed')->count(),
            'cancelled' => $allOrders->where('status', 'cancelled')->count(),
        ];

        return Inertia::render('Admin/Orders/Index', [
            'page' => 'admin.orders.index',
            'orders' => $orders,
            'metrics' => $metrics,
            'filters' => [
                'search' => $search,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => $status,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function show(Order $order): Response
    {
        $this->authorizeAdmin();

        $order->load([
            'user:id,name,email',
            'customerProfile:id,user_id,name,whatsapp_number,primary_address,member_status',
            'voucher:id,code,name',
            'paymentMethod:id,type,bank_name,account_number,account_holder_name,qris_image_path,instructions,is_active',
            'orderItems.product:id,name,slug,price',
            'voucherRedemption.voucher:id,code,name',
        ]);

        return Inertia::render('Admin/Orders/Show', [
            'page' => 'admin.orders.show',
            'order' => $order,
        ]);
    }

    public function updateShipping(UpdateOrderShippingRequest $request, Order $order, OrderFulfillmentService $fulfillmentService): RedirectResponse
    {
        $validated = $request->validated();
        $shippingStatus = $validated['shipping_status'];
        $status = $order->status;
        $paymentStatus = $order->payment_status;

        if ($shippingStatus === 'shipping_cost_confirmed') {
            $status = 'waiting_payment';
            $paymentStatus = 'waiting_payment';
        } elseif ($shippingStatus === 'ready_to_ship') {
            if ($order->payment_status !== 'paid') {
                throw ValidationException::withMessages([
                    'shipping_status' => 'Payment harus berstatus paid sebelum shipping siap dikirim.',
                ]);
            }

            $status = 'processing';
        }

        DB::transaction(function () use ($fulfillmentService, $order, $paymentStatus, $shippingStatus, $status, $validated): void {
            $order->update([
                'courier_name' => $validated['courier_name'] ?? null,
                'tracking_number' => $validated['tracking_number'] ?? null,
                'shipping_cost' => $validated['shipping_cost'],
                'shipping_status' => $shippingStatus,
                'shipping_notes' => $validated['shipping_notes'] ?? null,
                'total' => $order->subtotal - $order->voucher_discount_amount + $validated['shipping_cost'],
                'payment_status' => $paymentStatus,
                'status' => $status,
            ]);

            if ($status === 'processing') {
                $fulfillmentService->updateStatus($order->fresh(), [
                    'status' => 'processing',
                    'admin_notes' => $order->admin_notes,
                ]);
            }
        });

        $redirect = redirect()->route('admin.orders.show', $order)->with('success', 'Status pengiriman berhasil diperbarui.');
        $whatsappUrl = $this->customerWhatsappUrl($order->fresh(), 'shipping_'.$shippingStatus);

        if ($whatsappUrl !== null) {
            $redirect = $redirect->with('whatsapp_url', $whatsappUrl);
        }

        return $redirect;
    }

    public function updatePayment(UpdateOrderPaymentRequest $request, Order $order, OrderFulfillmentService $fulfillmentService): RedirectResponse
    {
        $validated = $request->validated();
        $paymentStatus = $validated['payment_status'];
        $paymentReceivedAt = $validated['payment_received_at'] ?? null;
        $paymentNotes = $validated['payment_notes'] ?? null;

        $fulfillmentService->processPayment($order, $paymentStatus, $paymentNotes, $paymentReceivedAt);

        $redirect = redirect()->route('admin.orders.show', $order)->with('success', 'Status pembayaran berhasil diperbarui.');
        $whatsappUrl = $this->customerWhatsappUrl($order->fresh(), 'payment_'.$paymentStatus);

        if ($whatsappUrl !== null) {
            $redirect = $redirect->with('whatsapp_url', $whatsappUrl);
        }

        return $redirect;
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order, OrderFulfillmentService $fulfillmentService): RedirectResponse
    {
        $validated = $request->validated();
        $fulfillmentService->updateStatus($order, $validated);

        $redirect = redirect()->route('admin.orders.show', $order)->with('success', 'Status order berhasil diperbarui.');
        $whatsappUrl = $this->customerWhatsappUrl($order->fresh(), 'status_'.$validated['status']);

        if ($whatsappUrl !== null) {
            $redirect = $redirect->with('whatsapp_url', $whatsappUrl);
        }

        return $redirect;
    }

    public function exportShipping(Request $request): StreamedResponse
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'order_ids' => ['nullable', 'array'],
            'order_ids.*' => ['integer', 'exists:orders,id'],
            'search' => ['nullable', 'string'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'status' => ['nullable', 'string'],
        ]);

        $orders = $this->filteredOrders($validated)
            ->with(['customerProfile:id,user_id,name,whatsapp_number,primary_address', 'paymentMethod:id,type,bank_name,account_holder_name'])
            ->latest()
            ->get();

        $filename = 'data-pengiriman-order-'.now()->format('Ymd-His').'.xlsx';

        return response()->streamDownload(function () use ($orders): void {
            $path = $this->buildXlsxFile($this->shippingRows($orders));

            readfile($path);
            unlink($path);
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    private function filteredOrders(array $filters)
    {
        $query = Order::query();

        if (! empty($filters['order_ids'])) {
            return $query->whereIn('id', $filters['order_ids']);
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search): void {
                $q->where('order_number', 'ILIKE', '%'.$search.'%')
                    ->orWhere('customer_name', 'ILIKE', '%'.$search.'%')
                    ->orWhereHas('customerProfile', function ($q2) use ($search): void {
                        $q2->where('name', 'ILIKE', '%'.$search.'%');
                    })
                    ->orWhereHas('user', function ($q2) use ($search): void {
                        $q2->where('name', 'ILIKE', '%'.$search.'%');
                    });
            });
        }

        if (! empty($filters['start_date'])) {
            $query->whereDate('created_at', '>=', $filters['start_date']);
        }

        if (! empty($filters['end_date'])) {
            $query->whereDate('created_at', '<=', $filters['end_date']);
        }

        if (! empty($filters['status']) && $filters['status'] !== 'all') {
            if ($filters['status'] === 'received') {
                $query->where(function ($q): void {
                    $q->where('status', 'payment_received')
                        ->orWhere('payment_status', 'paid');
                });
            } elseif ($filters['status'] === 'shipped') {
                $query->where(function ($q): void {
                    $q->where('status', 'shipped')
                        ->orWhere('shipping_status', 'shipped');
                });
            } else {
                $query->where('status', $filters['status']);
            }
        }

        return $query;
    }

    private function shippingRows(Collection $orders): array
    {
        $rows = [[
            'Nomor Order',
            'Customer',
            'WhatsApp',
            'Alamat Pengiriman',
            'Kurir',
            'Nomor Resi',
            'Status Order',
            'Status Pengiriman',
            'Status Pembayaran',
            'Metode Pembayaran',
            'Total',
            'Tanggal Order',
        ]];

        foreach ($orders as $order) {
            $method = $order->paymentMethod;
            $rows[] = [
                $order->order_number ?? 'Order #'.$order->id,
                $order->customerProfile?->name ?? $order->customer_name ?? 'Customer',
                $order->customer_whatsapp_number ?? $order->customerProfile?->whatsapp_number ?? '',
                $order->shipping_address ?? $order->customerProfile?->primary_address ?? '',
                $order->courier_name ?? '',
                $order->tracking_number ?? '',
                $order->status ?? '',
                $order->shipping_status ?? '',
                $order->payment_status ?? '',
                $method ? collect([$method->type, $method->bank_name, $method->account_holder_name])->filter()->implode(' / ') : '',
                (float) $order->total,
                optional($order->created_at)->format('Y-m-d H:i'),
            ];
        }

        return $rows;
    }

    private function buildXlsxFile(array $rows): string
    {
        $path = tempnam(sys_get_temp_dir(), 'phoenix-orders-');
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
                $style = $rowIndex === 0 ? 1 : 2;
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
            .'<sheets><sheet name="Data Pengiriman" sheetId="1" r:id="rId1"/></sheets>'
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
            .'<cellXfs count="3">'
            .'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
            .'<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>'
            .'<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/>'
            .'</cellXfs>'
            .'</styleSheet>';
    }

    private function customerWhatsappUrl(Order $order, string $event): ?string
    {
        $whatsappNumber = $this->normalizeCustomerWhatsapp($order->customer_whatsapp_number ?? $order->customerProfile?->whatsapp_number);

        if ($whatsappNumber === null) {
            return null;
        }

        $message = $this->customerWhatsappMessage($order, $event);

        if ($message === null) {
            return null;
        }

        return 'https://wa.me/'.$whatsappNumber.'?text='.rawurlencode($message);
    }

    private function customerWhatsappMessage(Order $order, string $event): ?string
    {
        $orderNumber = $order->order_number;
        $customerName = $order->customer_name ?? 'Customer';
        $totalFormatted = 'Rp '.number_format((float) $order->total, 0, ',', '.');
        $shippingCostFormatted = 'Rp '.number_format((float) $order->shipping_cost, 0, ',', '.');

        $lines = match ($event) {
            'shipping_shipping_cost_confirmed' => [
                'Halo '.$customerName.', terima kasih sudah berbelanja di Phoenix.',
                '',
                'Pesanan Anda dengan No. Order '.$orderNumber.' sudah kami konfirmasi ongkirnya.',
                'Ongkir: '.$shippingCostFormatted,
                'Total Pembayaran: '.$totalFormatted,
                '',
                'Silakan lanjutkan pembayaran sesuai metode yang dipilih, lalu konfirmasi ke kami setelah transfer. Terima kasih.',
            ],
            'shipping_ready_to_ship' => [
                'Halo '.$customerName.', pesanan Anda dengan No. Order '.$orderNumber.' sudah siap dikirim.',
                $order->courier_name ? 'Kurir: '.$order->courier_name : null,
                $order->tracking_number ? 'Nomor Resi: '.$order->tracking_number : null,
                '',
                'Mohon ditunggu, paket akan segera diserahkan ke kurir. Terima kasih.',
            ],
            'payment_paid' => [
                'Halo '.$customerName.', pembayaran untuk pesanan No. Order '.$orderNumber.' sudah kami terima.',
                'Total: '.$totalFormatted,
                '',
                'Pesanan Anda akan segera kami proses. Terima kasih.',
            ],
            'payment_cancelled' => [
                'Halo '.$customerName.', pesanan Anda dengan No. Order '.$orderNumber.' kami tandai sebagai dibatalkan.',
                '',
                'Apabila ada pertanyaan atau kendala, silakan balas pesan ini. Kami siap membantu.',
            ],
            'status_processing' => [
                'Halo '.$customerName.', pesanan No. Order '.$orderNumber.' sedang kami proses.',
                'Total: '.$totalFormatted,
                '',
                'Kami akan memberi kabar lagi saat pesanan dikirim. Terima kasih.',
            ],
            'status_shipped' => [
                'Halo '.$customerName.', pesanan No. Order '.$orderNumber.' sudah dikirim.',
                $order->courier_name ? 'Kurir: '.$order->courier_name : null,
                $order->tracking_number ? 'Nomor Resi: '.$order->tracking_number : null,
                '',
                'Silakan lacak paket Anda menggunakan nomor resi di atas. Terima kasih.',
            ],
            'status_completed' => [
                'Halo '.$customerName.', pesanan No. Order '.$orderNumber.' sudah selesai.',
                '',
                'Terima kasih sudah berbelanja di Phoenix. Sampai jumpa di pesanan berikutnya.',
            ],
            'status_cancelled' => [
                'Halo '.$customerName.', pesanan No. Order '.$orderNumber.' kami tandai sebagai dibatalkan.',
                '',
                'Apabila ada pertanyaan atau kendala, silakan balas pesan ini. Kami siap membantu.',
            ],
            default => null,
        };

        if ($lines === null) {
            return null;
        }

        return implode("\n", array_filter($lines, static fn ($line): bool => $line !== null));
    }

    private function normalizeCustomerWhatsapp(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $digits = preg_replace('/\D+/', '', $value) ?? '';

        if ($digits === '') {
            return null;
        }

        if (Str::startsWith($digits, '0')) {
            return '62'.substr($digits, 1);
        }

        if (Str::startsWith($digits, '62')) {
            return $digits;
        }

        if (Str::startsWith($digits, '8')) {
            return '62'.$digits;
        }

        return $digits;
    }

    public function invoice(Order $order)
    {
        $this->authorizeAdmin();

        $order->load([
            'user',
            'customerProfile',
            'orderItems.product',
            'paymentMethod',
        ]);

        $pdf = Pdf::loadView('admin.orders.invoice', [
            'order' => $order,
        ]);

        return $pdf->stream('Invoice-' . $order->order_number . '.pdf');
    }
}
