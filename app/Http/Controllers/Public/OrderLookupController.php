<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\StoreOrderLookupRequest;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OrderLookupController extends Controller
{
    private const LOOKUP_SESSION_KEY = 'guest_order_lookup';

    public function create(): Response
    {
        return Inertia::render('Public/Orders/Lookup');
    }

    public function store(StoreOrderLookupRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $order = Order::query()
            ->where('order_number', Str::upper($validated['order_number']))
            ->first();

        if ($order === null || ! $this->whatsappMatches($validated['customer_whatsapp_number'], $order->customer_whatsapp_number)) {
            throw ValidationException::withMessages([
                'order_number' => 'Nomor order atau nomor WhatsApp tidak cocok dengan data kami.',
            ]);
        }

        $this->authorizeSession($request, $order);

        return redirect()->route('orders.lookup.show', ['order' => $order->order_number]);
    }

    public function show(Request $request, Order $order): Response|RedirectResponse
    {
        if (! $this->isAuthorized($request, $order)) {
            return redirect()
                ->route('orders.lookup.create')
                ->with('error', 'Masukkan nomor order dan nomor WhatsApp untuk melihat transaksi.');
        }

        $order->load('orderItems.product', 'paymentMethod:id,type,bank_name,account_number,account_holder_name,qris_image_path,instructions');

        return Inertia::render('Public/Orders/Show', [
            'order' => $this->publicOrderPayload($order),
        ]);
    }

    public static function authorizeOrderForSession(Request $request, Order $order): void
    {
        $request->session()->put(self::sessionKey($order), true);
    }

    private function authorizeSession(Request $request, Order $order): void
    {
        self::authorizeOrderForSession($request, $order);
    }

    private function isAuthorized(Request $request, Order $order): bool
    {
        return $request->session()->has(self::sessionKey($order));
    }

    private static function sessionKey(Order $order): string
    {
        return self::LOOKUP_SESSION_KEY.'.'.$order->getKey();
    }

    private function whatsappMatches(string $input, string $stored): bool
    {
        return $this->normalizeWhatsapp($input) === $this->normalizeWhatsapp($stored);
    }

    private function normalizeWhatsapp(string $number): string
    {
        $digits = preg_replace('/\D+/', '', $number) ?? '';

        if (Str::startsWith($digits, '62')) {
            return '0'.substr($digits, 2);
        }

        return $digits;
    }

    private function publicPaymentMethodPayload(Order $order): ?array
    {
        if ($order->status !== 'waiting_payment' && $order->payment_status !== 'waiting_payment') {
            return null;
        }

        if ($order->paymentMethod === null) {
            return null;
        }

        return [
            'type' => $order->paymentMethod->type,
            'bank_name' => $order->paymentMethod->bank_name,
            'account_number' => $order->paymentMethod->account_number,
            'account_holder_name' => $order->paymentMethod->account_holder_name,
            'qris_image_path' => $order->paymentMethod->qris_image_path,
            'instructions' => $order->paymentMethod->instructions,
        ];
    }

    private function publicOrderPayload(Order $order): array
    {
        return [
            'order_number' => $order->order_number,
            'customer_name' => $order->customer_name,
            'subtotal' => $order->subtotal,
            'voucher_discount_amount' => $order->voucher_discount_amount,
            'shipping_cost' => $order->shipping_cost,
            'total' => $order->total,
            'courier_name' => $order->courier_name,
            'tracking_number' => $order->tracking_number,
            'shipping_status' => $order->shipping_status,
            'payment_status' => $order->payment_status,
            'status' => $order->status,
            'created_at' => $order->created_at,
            'payment_method' => $this->publicPaymentMethodPayload($order),
            'order_items' => $order->orderItems->map(fn ($item): array => [
                'product_name' => $item->product_name,
                'unit_price' => $item->unit_price,
                'quantity' => $item->quantity,
                'line_total' => $item->line_total,
                'product' => $item->product ? [
                    'name' => $item->product->name,
                    'slug' => $item->product->slug,
                    'image_path' => $item->product->image_path,
                ] : null,
            ])->values(),
        ];
    }
}
