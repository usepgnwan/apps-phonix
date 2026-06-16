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
        $query = Product::query()
            ->with('productCategory:id,name,slug')
            ->where('is_active', true);

        if ($search = request('search')) {
            $query->where('name', 'ilike', '%' . $search . '%');
        }

        if ($categorySlug = request('category')) {
            $query->whereHas('productCategory', function ($q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            });
        }

        $sort = request('sort', 'latest');
        if ($sort === 'name') {
            $query->orderBy('name');
        } elseif ($sort === 'price_low') {
            $query->orderBy('price', 'asc');
        } elseif ($sort === 'price_high') {
            $query->orderBy('price', 'desc');
        } else {
            $query->orderByDesc('is_featured')->latest();
        }

        $perPage = request('perPage', 12);
        if (!in_array($perPage, [12, 24, 36])) {
            $perPage = 12;
        }

        return Inertia::render('Public/Products/Index', [
            'products' => $query->paginate($perPage)->withQueryString(),
            'productCategories' => ProductCategory::query()
                ->withCount(['products' => fn ($query) => $query->where('is_active', true)])
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'slug', 'description']),
        ]);
    }

    public function show(Product $product): Response
    {
        abort_unless($product->is_active, 404);

        $product->load('productCategory:id,name,slug');

        return Inertia::render('Public/Products/Show', [
            'product' => $product,
            'relatedProducts' => Product::query()
                ->with('productCategory:id,name,slug')
                ->where('is_active', true)
                ->where('product_category_id', $product->product_category_id)
                ->whereKeyNot($product->id)
                ->latest()
                ->limit(4)
                ->get(['id', 'product_category_id', 'name', 'slug', 'price', 'short_description', 'image_path', 'is_featured']),
        ]);
    }
}
