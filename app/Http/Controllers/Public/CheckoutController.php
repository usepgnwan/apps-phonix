<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\StoreCheckoutRequest;
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

        return Inertia::render('Welcome', [
            'page' => 'checkout.show',
            'cart' => $cart,
            'customerProfile' => $cart->customerProfile,
        ]);
    }

    public function store(StoreCheckoutRequest $request): RedirectResponse
    {
        $cart = $this->cartResolver->resolve($request);
        $order = $this->checkoutService->checkout($cart, $request->validated());

        return redirect()
            ->route('cart.index')
            ->with('success', 'Order berhasil dibuat dan menunggu konfirmasi ongkir admin.')
            ->with('order_number', $order->order_number);
    }
}
