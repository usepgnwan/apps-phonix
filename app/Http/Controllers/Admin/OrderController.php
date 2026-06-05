<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateOrderPaymentRequest;
use App\Http\Requests\Admin\UpdateOrderShippingRequest;
use App\Http\Requests\Admin\UpdateOrderStatusRequest;
use App\Models\Order;
use App\Models\PaymentMethod;
use App\Services\OrderFulfillmentService;
use Illuminate\Http\RedirectResponse;
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
                ->with(['user:id,name,email', 'customerProfile:id,user_id,name,whatsapp_number,primary_address', 'voucher:id,code,name', 'paymentMethod:id,type,bank_name,account_holder_name,is_active'])
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
            'paymentMethod:id,type,bank_name,account_holder_name,is_active',
            'orderItems.product:id,name,slug,price',
            'voucherRedemption.voucher:id,code,name',
        ]);

        return Inertia::render('Admin/Orders/Show', [
            'page' => 'admin.orders.show',
            'order' => $order,
            'paymentMethods' => PaymentMethod::query()->where('is_active', true)->orderBy('type')->get(['id', 'type', 'bank_name', 'account_holder_name', 'is_active']),
        ]);
    }

    public function updateShipping(UpdateOrderShippingRequest $request, Order $order): RedirectResponse
    {
        $validated = $request->validated();
        $shippingStatus = $validated['shipping_status'];
        $status = $order->status;

        if (in_array($shippingStatus, ['shipping_cost_confirmed', 'ready_to_ship'], true)) {
            $status = 'waiting_payment';
        } elseif ($shippingStatus === 'cancelled') {
            $status = 'cancelled';
        }

        $order->update([
            'courier_name' => $validated['courier_name'] ?? null,
            'tracking_number' => $validated['tracking_number'] ?? null,
            'shipping_cost' => $validated['shipping_cost'],
            'shipping_status' => $shippingStatus,
            'shipping_notes' => $validated['shipping_notes'] ?? null,
            'total' => $order->subtotal - $order->voucher_discount_amount + $validated['shipping_cost'],
            'status' => $status,
        ]);

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
            'payment_method_id' => $validated['payment_method_id'] ?? null,
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
