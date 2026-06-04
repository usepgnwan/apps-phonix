<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductCategory;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Welcome', [
            'page' => 'products.index',
            'products' => Product::query()
                ->with('productCategory:id,name,slug')
                ->where('is_active', true)
                ->latest()
                ->paginate(12)
                ->withQueryString(),
            'productCategories' => ProductCategory::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'slug', 'description']),
        ]);
    }

    public function show(Product $product): Response
    {
        abort_unless($product->is_active, 404);

        $product->load('productCategory:id,name,slug');

        return Inertia::render('Welcome', [
            'page' => 'products.show',
            'product' => $product,
            'relatedProducts' => Product::query()
                ->with('productCategory:id,name,slug')
                ->where('is_active', true)
                ->where('product_category_id', $product->product_category_id)
                ->whereKeyNot($product->id)
                ->latest()
                ->limit(4)
                ->get(['id', 'product_category_id', 'name', 'slug', 'price', 'short_description', 'image_path']),
        ]);
    }
}
