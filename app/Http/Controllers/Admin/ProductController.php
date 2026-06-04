<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    private function authorizeAdmin(): void
    {
        $user = request()->user();

        abort_unless($user !== null && $user->role === 'admin' && $user->is_active, 403);
    }

    public function index(): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Welcome', [
            'page' => 'admin.products.index',
            'products' => Product::query()->with('productCategory:id,name,slug')->latest()->get(),
        ]);
    }

    public function create(): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Welcome', [
            'page' => 'admin.products.create',
            'productCategories' => ProductCategory::query()->orderBy('name')->get(['id', 'name', 'slug']),
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        Product::query()->create($request->validated());

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'Produk berhasil disimpan.');
    }

    public function show(Product $product): Response
    {
        $this->authorizeAdmin();

        $product->load('productCategory:id,name,slug');

        return Inertia::render('Welcome', [
            'page' => 'admin.products.show',
            'product' => $product,
        ]);
    }

    public function edit(Product $product): Response
    {
        $this->authorizeAdmin();

        $product->load('productCategory:id,name,slug');

        return Inertia::render('Welcome', [
            'page' => 'admin.products.edit',
            'product' => $product,
            'productCategories' => ProductCategory::query()->orderBy('name')->get(['id', 'name', 'slug']),
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $product->update($request->validated());

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $this->authorizeAdmin();

        $product->delete();

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'Produk berhasil dihapus.');
    }
}
