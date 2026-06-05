<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_product_index_renders_public_products_index_component(): void
    {
        $product = $this->createProduct();

        $response = $this->withHeaders($this->inertiaHeaders())->get(route('products.index'));

        $response
            ->assertOk()
            ->assertJsonPath('component', 'Public/Products/Index')
            ->assertJsonPath('props.products.data.0.id', $product->id);
    }

    public function test_product_show_renders_public_products_show_component(): void
    {
        $product = $this->createProduct();

        $response = $this->withHeaders($this->inertiaHeaders())->get(route('products.show', $product));

        $response
            ->assertOk()
            ->assertJsonPath('component', 'Public/Products/Show')
            ->assertJsonPath('props.product.id', $product->id);
    }

    private function createProduct(bool $isActive = true): Product
    {
        $category = ProductCategory::query()->create([
            'name' => 'Herbal',
            'slug' => 'herbal-'.ProductCategory::query()->count(),
            'is_active' => true,
        ]);

        return Product::query()->create([
            'product_category_id' => $category->id,
            'name' => 'Produk Herbal '.Product::query()->count(),
            'slug' => 'produk-herbal-'.Product::query()->count(),
            'price' => 100000,
            'short_description' => 'Deskripsi singkat produk herbal.',
            'full_description' => 'Deskripsi lengkap produk herbal.',
            'stock_quantity' => 10,
            'low_stock_threshold' => 1,
            'is_active' => $isActive,
            'is_featured' => false,
        ]);
    }

    private function inertiaHeaders(): array
    {
        $headers = ['X-Inertia' => 'true'];

        if (file_exists(public_path('build/manifest.json'))) {
            $headers['X-Inertia-Version'] = hash_file('xxh128', public_path('build/manifest.json'));
        }

        return $headers;
    }
}
