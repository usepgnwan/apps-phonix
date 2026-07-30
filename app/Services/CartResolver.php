<?php

namespace App\Services;

use App\Models\BranchProductStock;
use App\Models\Cart;
use App\Models\CustomerProfile;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CartResolver
{
    public const BUY_NOW_SESSION_KEY = 'buy_now_cart_session_id';

    public const CHECKOUT_SOURCE_SESSION_KEY = 'checkout_source';

    public function resolve(Request $request): Cart
    {
        $user = $request->user();

        if ($user !== null) {
            $customerProfile = CustomerProfile::query()
                ->where('user_id', $user->id)
                ->first();

            $cart = $this->mainCartQuery()
                ->where('user_id', $user->id)
                ->first();

            if ($cart === null) {
                $cart = Cart::query()->create([
                    'user_id' => $user->id,
                    'customer_profile_id' => $customerProfile?->id,
                    'session_id' => null,
                ]);
            } elseif ($cart->customer_profile_id !== $customerProfile?->id) {
                $cart->update(['customer_profile_id' => $customerProfile?->id]);
            }

            return $cart;
        }

        $sessionId = $request->session()->get('cart_session_id');

        if ($sessionId === null) {
            $sessionId = Str::uuid()->toString();
            $request->session()->put('cart_session_id', $sessionId);
        }

        return Cart::query()->firstOrCreate(
            ['session_id' => $sessionId],
            [
                'user_id' => null,
                'customer_profile_id' => null,
            ],
        );
    }

    public function existing(Request $request): ?Cart
    {
        $user = $request->user();

        if ($user !== null) {
            return $this->mainCartQuery()
                ->where('user_id', $user->id)
                ->first();
        }

        $sessionId = $request->session()->get('cart_session_id');

        if ($sessionId === null) {
            return null;
        }

        return Cart::query()
            ->where('session_id', $sessionId)
            ->first();
    }

    public function resolveForCheckout(Request $request): Cart
    {
        if ($this->isBuyNowCheckout($request)) {
            $buyNowCart = $this->existingBuyNowCart($request);

            if ($buyNowCart !== null && $buyNowCart->cartItems()->exists()) {
                return $this->syncBuyNowCartOwner($buyNowCart, $request);
            }

            $request->session()->forget(self::CHECKOUT_SOURCE_SESSION_KEY);
        }

        return $this->resolve($request);
    }

    public function startBuyNow(Request $request, int $productId, int $quantity, int $branchId): Cart
    {
        $product = Product::query()->findOrFail($productId);

        if (! $product->is_active) {
            throw ValidationException::withMessages([
                'product_id' => 'Produk sudah tidak aktif.',
            ]);
        }

        $branchStock = BranchProductStock::query()
            ->where('branch_id', $branchId)
            ->where('product_id', $product->id)
            ->first();

        $availableStock = $branchStock?->stock_quantity ?? 0;

        if ($quantity > $availableStock) {
            throw ValidationException::withMessages([
                'quantity' => 'Jumlah produk melebihi stok tersedia di cabang ini.',
            ]);
        }

        $cart = $this->resolveBuyNowCart($request);
        $cart = $this->syncBuyNowCartOwner($cart, $request);

        $cart->cartItems()->delete();
        $cart->update(['branch_id' => $branchId]);
        $cart->cartItems()->create([
            'product_id' => $product->id,
            'quantity' => $quantity,
        ]);

        $request->session()->put(self::CHECKOUT_SOURCE_SESSION_KEY, 'buy_now');

        return $cart->fresh(['cartItems.product']);
    }

    public function clearBuyNow(Request $request): void
    {
        $cart = $this->existingBuyNowCart($request);

        if ($cart !== null) {
            $cart->cartItems()->delete();
            $cart->update(['branch_id' => null, 'user_id' => null, 'customer_profile_id' => null]);
        }

        $request->session()->forget([
            self::BUY_NOW_SESSION_KEY,
            self::CHECKOUT_SOURCE_SESSION_KEY,
        ]);
    }

    public function isBuyNowCheckout(Request $request): bool
    {
        return $request->session()->get(self::CHECKOUT_SOURCE_SESSION_KEY) === 'buy_now';
    }

    private function resolveBuyNowCart(Request $request): Cart
    {
        $token = $request->session()->get(self::BUY_NOW_SESSION_KEY);

        if ($token === null) {
            $token = Str::uuid()->toString();
            $request->session()->put(self::BUY_NOW_SESSION_KEY, $token);
        }

        $sessionId = 'buy_now:'.$token;

        return Cart::query()->firstOrCreate(
            ['session_id' => $sessionId],
            [
                'user_id' => null,
                'customer_profile_id' => null,
                'branch_id' => null,
            ],
        );
    }

    private function existingBuyNowCart(Request $request): ?Cart
    {
        $token = $request->session()->get(self::BUY_NOW_SESSION_KEY);

        if ($token === null) {
            return null;
        }

        return Cart::query()
            ->where('session_id', 'buy_now:'.$token)
            ->first();
    }

    private function syncBuyNowCartOwner(Cart $cart, Request $request): Cart
    {
        $user = $request->user();

        if ($user === null) {
            if ($cart->user_id !== null || $cart->customer_profile_id !== null) {
                $cart->update([
                    'user_id' => null,
                    'customer_profile_id' => null,
                ]);
            }

            return $cart->refresh();
        }

        $customerProfile = CustomerProfile::query()
            ->where('user_id', $user->id)
            ->first();

        $cart->forceFill([
            'user_id' => $user->id,
            'customer_profile_id' => $customerProfile?->id,
        ])->save();

        return $cart->refresh();
    }

    private function mainCartQuery()
    {
        return Cart::query()->where(function ($query): void {
            $query->whereNull('session_id')
                ->orWhere('session_id', 'not like', 'buy_now:%');
        });
    }
}
