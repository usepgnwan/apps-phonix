<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\StoreCartItemRequest;
use App\Http\Requests\Public\UpdateCartItemRequest;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\BranchProductStock;
use App\Services\CartResolver;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function __construct(private readonly CartResolver $cartResolver)
    {
    }

    public function index(Request $request): Response
    {
        $cart = $this->cartResolver->resolve($request)->load('cartItems.product.productCategory', 'branch');

        return Inertia::render('Public/Cart/Index', [
            'cart' => $cart,
        ]);
    }

    public function store(StoreCartItemRequest $request): RedirectResponse
    {
        $cart = $this->cartResolver->resolve($request);
        $product = Product::query()->findOrFail($request->integer('product_id'));
        $quantity = $request->integer('quantity');
        $branchId = $request->integer('branch_id');

        if (! $product->is_active) {
            throw ValidationException::withMessages([
                'product_id' => 'Produk sudah tidak aktif.',
            ]);
        }

        if ($cart->branch_id === null && $cart->cartItems()->count() === 0) {
            $cart->update(['branch_id' => $branchId]);
        }

        if ($cart->branch_id !== null && $cart->branch_id !== $branchId) {
            throw ValidationException::withMessages([
                'branch_id' => 'Barang di keranjang Anda berasal dari cabang lain. Silakan selesaikan pesanan terlebih dahulu atau kosongkan keranjang.',
            ]);
        }

        $branchStock = BranchProductStock::query()
            ->where('branch_id', $branchId)
            ->where('product_id', $product->id)
            ->first();

        $availableStock = $branchStock?->stock_quantity ?? 0;

        $cartItem = $cart->cartItems()
            ->where('product_id', $product->id)
            ->first();
        $newQuantity = ($cartItem?->quantity ?? 0) + $quantity;

        if ($newQuantity > $availableStock) {
            throw ValidationException::withMessages([
                'quantity' => 'Jumlah produk melebihi stok tersedia di cabang ini.',
            ]);
        }

        $cart->cartItems()->updateOrCreate(
            ['product_id' => $product->id],
            ['quantity' => $newQuantity],
        );

        return redirect()
            ->back()
            ->with('success', 'Produk berhasil ditambahkan ke keranjang.');
    }

    public function update(UpdateCartItemRequest $request, CartItem $cartItem): RedirectResponse
    {
        $cart = $this->cartResolver->resolve($request);

        if ($cartItem->cart_id !== $cart->id) {
            abort(404);
        }

        $cartItem->load('product');
        $quantity = $request->integer('quantity');

        if (! $cartItem->product->is_active) {
            throw ValidationException::withMessages([
                'quantity' => 'Produk sudah tidak aktif.',
            ]);
        }

        $branchStock = BranchProductStock::query()
            ->where('branch_id', $cart->branch_id)
            ->where('product_id', $cartItem->product->id)
            ->first();

        $availableStock = $branchStock?->stock_quantity ?? 0;

        if ($quantity > $availableStock) {
            throw ValidationException::withMessages([
                'quantity' => 'Jumlah produk melebihi stok tersedia di cabang ini.',
            ]);
        }

        $cartItem->update(['quantity' => $quantity]);

        return redirect()
            ->back()
            ->with('success', 'Keranjang berhasil diperbarui.');
    }

    public function destroy(Request $request, CartItem $cartItem): RedirectResponse
    {
        $cart = $this->cartResolver->resolve($request);

        if ($cartItem->cart_id !== $cart->id) {
            abort(404);
        }

        $cartItem->delete();

        if ($cart->cartItems()->count() === 0) {
            $cart->update(['branch_id' => null]);
        }

        return redirect()
            ->back()
            ->with('success', 'Produk berhasil dihapus dari keranjang.');
    }
}
