<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CustomerProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CartResolver
{
    public function resolve(Request $request): Cart
    {
        $user = $request->user();

        if ($user !== null) {
            $customerProfile = CustomerProfile::query()
                ->where('user_id', $user->id)
                ->first();

            $cart = Cart::query()->firstOrCreate(
                ['user_id' => $user->id],
                [
                    'customer_profile_id' => $customerProfile?->id,
                    'session_id' => null,
                ],
            );

            if ($cart->customer_profile_id !== $customerProfile?->id) {
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
}
