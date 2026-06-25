<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\StoreCheckoutRequest;
use App\Models\Order;
use App\Models\PaymentMethod;
use App\Models\Setting;
use App\Services\CartResolver;
use App\Services\CheckoutService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly CartResolver $cartResolver,
        private readonly CheckoutService $checkoutService,
    ) {
    }

    public function show(Request $request): Response
    {
        $cart = $this->cartResolver->resolve($request)->load('cartItems.product.productCategory');
        $authUser = $request->user();
        $customerProfile = $cart->customerProfile?->load('user');
        $savedShippingAddresses = collect();

        if ($authUser !== null) {
            $savedShippingAddresses = collect([$customerProfile?->primary_address])
                ->merge(
                    Order::query()
                        ->where(function ($query) use ($authUser, $customerProfile): void {
                            $query->where('user_id', $authUser->id);

                            if ($customerProfile !== null) {
                                $query->orWhere('customer_profile_id', $customerProfile->id);
                            }
                        })
                        ->latest()
                        ->pluck('shipping_address'),
                )
                ->filter()
                ->unique()
                ->values();
        }

        $availableVouchers = \App\Models\Voucher::query()
            ->where('is_published', true)
            ->where(function ($query) {
                $query->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            })
            ->when($customerProfile?->member_status !== 'member', function ($query) {
                $query->where('target_audience', '!=', 'member');
            })
            ->get(['id', 'code', 'name', 'description', 'discount_type', 'discount_value', 'minimum_purchase']);

        return Inertia::render('Public/Checkout/Show', [
            'cart' => $cart,
            'authUser' => $authUser?->only(['name', 'email']),
            'customerProfile' => $customerProfile,
            'paymentMethods' => PaymentMethod::query()
                ->where('is_active', true)
                ->orderBy('type')
                ->orderBy('bank_name')
                ->get(['id', 'type', 'bank_name', 'account_number', 'account_holder_name', 'qris_image_path', 'instructions']),
            'savedShippingAddresses' => $savedShippingAddresses,
            'availableVouchers' => $availableVouchers,
        ]);
    }

    public function store(StoreCheckoutRequest $request): RedirectResponse
    {
        $cart = $this->cartResolver->resolve($request);
        $order = $this->checkoutService->checkout($cart, $request->validated());
        OrderLookupController::authorizeOrderForSession($request, $order);

        return redirect()
            ->route('orders.lookup.show', ['order' => $order->order_number])
            ->with('success', 'Order berhasil dibuat dan menunggu konfirmasi ongkir admin.')
            ->with('order_number', $order->order_number)
            ->with('whatsapp_url', $this->orderWhatsappUrl($order));
    }

    public function validateVoucher(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'voucher_code' => ['required', 'string', 'max:255'],
            ]);

            $cart = $this->cartResolver->resolve($request)->load('cartItems.product', 'user', 'customerProfile');

            if ($cart->cartItems->isEmpty()) {
                throw ValidationException::withMessages([
                    'cart' => 'Keranjang masih kosong.',
                ]);
            }

            $subtotal = $cart->cartItems->sum(function ($cartItem): float {
                $product = $cartItem->product;

                if ($product === null || ! $product->is_active) {
                    throw ValidationException::withMessages([
                        'cart' => 'Produk tidak valid atau sudah tidak aktif.',
                    ]);
                }

                return (float) $product->price * (int) $cartItem->quantity;
            });

            [$voucher, $discountAmount] = $this->checkoutService->previewVoucher($cart, $validated['voucher_code'], $subtotal, $request->input('customer_whatsapp_number'));
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

    private function orderWhatsappUrl(Order $order): string
    {
        $order->loadMissing('orderItems');

        $itemLines = $order->orderItems->map(
            fn ($item): string => '- '.$item->product_name.' x '.$item->quantity,
        )->all();

        $messageLines = [
            'Halo Admin Phoenix, saya ingin konfirmasi pesanan dan minta info ongkir.',
            '',
            'No. Order: '.$order->order_number,
            'Nama: '.$order->customer_name,
            'WhatsApp: '.$order->customer_whatsapp_number,
            'Alamat: '.$order->shipping_address,
            '',
            'Item:',
            ...$itemLines,
            '',
            'Subtotal: Rp '.number_format((float) $order->subtotal, 0, ',', '.'),
            '',
            'Mohon dibantu konfirmasi biaya pengiriman ke alamat di atas. Terima kasih.',
        ];

        $whatsappNumber = Setting::query()->where('key', 'whatsapp_number')->value('value') ?: '6281234567890';

        return 'https://wa.me/'.$whatsappNumber.'?text='.rawurlencode(implode("\n", $messageLines));
    }
}
