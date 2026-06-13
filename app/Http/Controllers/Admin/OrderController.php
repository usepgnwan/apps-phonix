<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateOrderPaymentRequest;
use App\Http\Requests\Admin\UpdateOrderShippingRequest;
use App\Http\Requests\Admin\UpdateOrderStatusRequest;
use App\Models\Order;
use App\Services\OrderFulfillmentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

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

        return Inertia::render('Admin/Orders/Index', [
            'page' => 'admin.orders.index',
            'orders' => Order::query()
                ->with(['user:id,name,email', 'customerProfile:id,user_id,name,whatsapp_number,primary_address', 'voucher:id,code,name', 'paymentMethod:id,type,bank_name,account_number,account_holder_name,qris_image_path,instructions,is_active'])
                ->latest()
                ->get(),
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

    public function updatePayment(UpdateOrderPaymentRequest $request, Order $order): RedirectResponse
    {
        $validated = $request->validated();
        $paymentStatus = $validated['payment_status'];
        $status = $order->status;
        $paymentReceivedAt = $validated['payment_received_at'] ?? null;

        if ($paymentStatus === 'paid') {
            $status = 'payment_received';
            $paymentReceivedAt = $paymentReceivedAt ?? now();
        } elseif ($paymentStatus === 'waiting_payment') {
            $status = 'waiting_payment';
        } elseif ($paymentStatus === 'cancelled') {
            $status = 'cancelled';
        }

        $order->update([
            'payment_status' => $paymentStatus,
            'payment_received_at' => $paymentReceivedAt,
            'payment_notes' => $validated['payment_notes'] ?? null,
            'status' => $status,
        ]);

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
}
