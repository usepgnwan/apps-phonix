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

        return redirect()->route('admin.orders.show', $order)->with('success', 'Status pengiriman berhasil diperbarui.');
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

        return redirect()->route('admin.orders.show', $order)->with('success', 'Status pembayaran berhasil diperbarui.');
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order, OrderFulfillmentService $fulfillmentService): RedirectResponse
    {
        $fulfillmentService->updateStatus($order, $request->validated());

        return redirect()->route('admin.orders.show', $order)->with('success', 'Status order berhasil diperbarui.');
    }
}
