<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\StoreCheckoutRequest;
use App\Models\Order;
use App\Models\PaymentMethod;
use App\Services\CartResolver;
use App\Services\CheckoutService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
            ->with('order_number', $order->order_number);
    }
}
