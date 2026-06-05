<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductCategoryRequest;
use App\Http\Requests\Admin\UpdateProductCategoryRequest;
use App\Models\ProductCategory;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProductCategoryController extends Controller
{
    private function authorizeAdmin(): void
    {
        $user = request()->user();

        abort_unless($user !== null && $user->role === 'admin' && $user->is_active, 403);
    }

    public function index(): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Admin/ProductCategories/Index', [
            'page' => 'admin.product-categories.index',
            'productCategories' => ProductCategory::query()->latest()->get(),
        ]);
    }

    public function create(): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Admin/ProductCategories/Create', [
            'page' => 'admin.product-categories.create',
        ]);
    }

    public function store(StoreProductCategoryRequest $request): RedirectResponse
    {
        ProductCategory::query()->create($request->validated());

        return redirect()
            ->route('admin.product-categories.index')
            ->with('success', 'Kategori produk berhasil disimpan.');
    }

    public function show(ProductCategory $productCategory): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Admin/ProductCategories/Show', [
            'page' => 'admin.product-categories.show',
            'productCategory' => $productCategory,
        ]);
    }

    public function edit(ProductCategory $productCategory): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Admin/ProductCategories/Edit', [
            'page' => 'admin.product-categories.edit',
            'productCategory' => $productCategory,
        ]);
    }

    public function update(UpdateProductCategoryRequest $request, ProductCategory $productCategory): RedirectResponse
    {
        $productCategory->update($request->validated());

        return redirect()
            ->route('admin.product-categories.index')
            ->with('success', 'Kategori produk berhasil diperbarui.');
    }

    public function destroy(ProductCategory $productCategory): RedirectResponse
    {
        $this->authorizeAdmin();

        if ($productCategory->products()->exists()) {
            return redirect()->route('admin.product-categories.index')->with('error', 'Kategori tidak dapat dihapus karena masih memiliki produk.');
        }

        $productCategory->delete();

        return redirect()
            ->route('admin.product-categories.index')
            ->with('success', 'Kategori produk berhasil dihapus.');
    }
}
