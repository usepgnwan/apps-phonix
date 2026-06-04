<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_admin_catalog_routes(): void
    {
        $response = $this->get(route('admin.product-categories.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_non_admin_gets_forbidden_from_admin_catalog_routes(): void
    {
        $user = User::factory()->create(['role' => 'customer', 'is_active' => true]);

        $response = $this->actingAs($user)->get(route('admin.product-categories.index'));

        $response->assertForbidden();
    }

    public function test_active_admin_can_view_admin_catalog_placeholders(): void
    {
        $admin = $this->createAdmin();
        $category = $this->createCategory();
        $product = $this->createProduct($category);
        $service = $this->createService();

        $this->actingAs($admin)->withHeader('X-Inertia', 'true')->get(route('admin.product-categories.index'))
            ->assertOk()->assertJsonPath('component', 'Welcome')->assertJsonPath('props.page', 'admin.product-categories.index')
            ->assertJsonCount(1, 'props.productCategories');

        $this->actingAs($admin)->withHeader('X-Inertia', 'true')->get(route('admin.product-categories.create'))
            ->assertOk()->assertJsonPath('component', 'Welcome')->assertJsonPath('props.page', 'admin.product-categories.create');

        $this->actingAs($admin)->withHeader('X-Inertia', 'true')->get(route('admin.product-categories.show', $category))
            ->assertOk()->assertJsonPath('component', 'Welcome')->assertJsonPath('props.page', 'admin.product-categories.show');

        $this->actingAs($admin)->withHeader('X-Inertia', 'true')->get(route('admin.product-categories.edit', $category))
            ->assertOk()->assertJsonPath('component', 'Welcome')->assertJsonPath('props.page', 'admin.product-categories.edit');

        $this->actingAs($admin)->withHeader('X-Inertia', 'true')->get(route('admin.products.index'))
            ->assertOk()->assertJsonPath('component', 'Welcome')->assertJsonPath('props.page', 'admin.products.index');

        $this->actingAs($admin)->withHeader('X-Inertia', 'true')->get(route('admin.products.create'))
            ->assertOk()->assertJsonPath('component', 'Welcome')->assertJsonPath('props.page', 'admin.products.create')
            ->assertJsonCount(1, 'props.productCategories');

        $this->actingAs($admin)->withHeader('X-Inertia', 'true')->get(route('admin.products.show', $product))
            ->assertOk()->assertJsonPath('component', 'Welcome')->assertJsonPath('props.page', 'admin.products.show');

        $this->actingAs($admin)->withHeader('X-Inertia', 'true')->get(route('admin.products.edit', $product))
            ->assertOk()->assertJsonPath('component', 'Welcome')->assertJsonPath('props.page', 'admin.products.edit')
            ->assertJsonCount(1, 'props.productCategories');

        $this->actingAs($admin)->withHeader('X-Inertia', 'true')->get(route('admin.services.index'))
            ->assertOk()->assertJsonPath('component', 'Welcome')->assertJsonPath('props.page', 'admin.services.index');

        $this->actingAs($admin)->withHeader('X-Inertia', 'true')->get(route('admin.services.create'))
            ->assertOk()->assertJsonPath('component', 'Welcome')->assertJsonPath('props.page', 'admin.services.create');

        $this->actingAs($admin)->withHeader('X-Inertia', 'true')->get(route('admin.services.show', $service))
            ->assertOk()->assertJsonPath('component', 'Welcome')->assertJsonPath('props.page', 'admin.services.show');

        $this->actingAs($admin)->withHeader('X-Inertia', 'true')->get(route('admin.services.edit', $service))
            ->assertOk()->assertJsonPath('component', 'Welcome')->assertJsonPath('props.page', 'admin.services.edit');
    }

    public function test_active_admin_can_crud_product_categories(): void
    {
        $admin = $this->createAdmin();
        $category = $this->createCategory(slug: 'lama-kategori');

        $createResponse = $this->actingAs($admin)->post(route('admin.product-categories.store'), [
            'name' => 'Kategori Baru',
            'slug' => 'kategori-baru',
            'description' => 'Deskripsi kategori baru',
            'is_active' => true,
        ]);
        $createResponse->assertRedirect(route('admin.product-categories.index'));

        $created = ProductCategory::query()->where('slug', 'kategori-baru')->firstOrFail();

        $updateResponse = $this->actingAs($admin)->patch(route('admin.product-categories.update', $category), [
            'name' => 'Kategori Diubah',
            'slug' => 'kategori-diubah',
            'description' => 'Deskripsi diubah',
            'is_active' => false,
        ]);
        $updateResponse->assertRedirect(route('admin.product-categories.index'));

        $deleteResponse = $this->actingAs($admin)->delete(route('admin.product-categories.destroy', $created));
        $deleteResponse->assertRedirect(route('admin.product-categories.index'));

        $this->assertDatabaseHas('product_categories', [
            'id' => $category->id,
            'name' => 'Kategori Diubah',
            'slug' => 'kategori-diubah',
            'is_active' => false,
        ]);
        $this->assertDatabaseMissing('product_categories', ['id' => $created->id]);
    }

    public function test_product_category_slug_validation_works_on_create_and_update(): void
    {
        $admin = $this->createAdmin();
        $category = $this->createCategory(slug: 'unik-kategori');
        $other = $this->createCategory(slug: 'kategori-lain');

        $this->actingAs($admin)->post(route('admin.product-categories.store'), [
            'name' => 'Duplikat',
            'slug' => 'unik-kategori',
            'description' => null,
            'is_active' => true,
        ])->assertSessionHasErrors('slug');

        $this->actingAs($admin)->patch(route('admin.product-categories.update', $other), [
            'name' => 'Kategori Lain',
            'slug' => 'unik-kategori',
            'description' => null,
            'is_active' => true,
        ])->assertSessionHasErrors('slug');

        $this->actingAs($admin)->patch(route('admin.product-categories.update', $category), [
            'name' => 'Unik Kategori',
            'slug' => 'unik-kategori',
            'description' => null,
            'is_active' => true,
        ])->assertSessionHasNoErrors();
    }

    public function test_category_deletion_is_blocked_when_category_has_products(): void
    {
        $admin = $this->createAdmin();
        $category = $this->createCategory();
        $this->createProduct($category);

        $response = $this->actingAs($admin)->delete(route('admin.product-categories.destroy', $category));

        $response->assertRedirect(route('admin.product-categories.index'));
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('product_categories', ['id' => $category->id]);
    }

    public function test_active_admin_can_crud_products(): void
    {
        $admin = $this->createAdmin();
        $category = $this->createCategory();
        $product = $this->createProduct($category, slug: 'lama-produk');

        $createResponse = $this->actingAs($admin)->post(route('admin.products.store'), [
            'product_category_id' => $category->id,
            'name' => 'Produk Baru',
            'slug' => 'produk-baru',
            'price' => 125000,
            'short_description' => 'Singkat',
            'full_description' => 'Lengkap',
            'benefits' => 'Manfaat',
            'usage_rules' => 'Aturan',
            'notes' => 'Catatan',
            'image_path' => null,
            'stock_quantity' => 10,
            'low_stock_threshold' => 2,
            'is_active' => true,
            'is_featured' => false,
        ]);
        $createResponse->assertRedirect(route('admin.products.index'));

        $created = Product::query()->where('slug', 'produk-baru')->firstOrFail();

        $updateResponse = $this->actingAs($admin)->patch(route('admin.products.update', $product), [
            'product_category_id' => $category->id,
            'name' => 'Produk Diubah',
            'slug' => 'produk-diubah',
            'price' => 150000,
            'short_description' => 'Singkat diubah',
            'full_description' => 'Lengkap diubah',
            'benefits' => null,
            'usage_rules' => null,
            'notes' => null,
            'image_path' => 'images/product.jpg',
            'stock_quantity' => 5,
            'low_stock_threshold' => 1,
            'is_active' => false,
            'is_featured' => true,
        ]);
        $updateResponse->assertRedirect(route('admin.products.index'));

        $deleteResponse = $this->actingAs($admin)->delete(route('admin.products.destroy', $created));
        $deleteResponse->assertRedirect(route('admin.products.index'));

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Produk Diubah',
            'slug' => 'produk-diubah',
        ]);
        $this->assertDatabaseMissing('products', ['id' => $created->id]);
    }

    public function test_product_slug_validation_works_on_create_and_update(): void
    {
        $admin = $this->createAdmin();
        $category = $this->createCategory();
        $product = $this->createProduct($category, slug: 'unik-produk');
        $other = $this->createProduct($category, slug: 'produk-lain');

        $payload = $this->productPayload($category->id, slug: 'unik-produk');

        $this->actingAs($admin)->post(route('admin.products.store'), $payload)->assertSessionHasErrors('slug');

        $updatePayload = $this->productPayload($category->id, slug: 'unik-produk');
        $this->actingAs($admin)->patch(route('admin.products.update', $other), $updatePayload)->assertSessionHasErrors('slug');

        $this->actingAs($admin)->patch(route('admin.products.update', $product), $this->productPayload($category->id, slug: 'unik-produk'))
            ->assertSessionHasNoErrors();
    }

    public function test_active_admin_can_crud_services(): void
    {
        $admin = $this->createAdmin();
        $service = $this->createService(slug: 'lama-service');

        $createResponse = $this->actingAs($admin)->post(route('admin.services.store'), [
            'name' => 'Service Baru',
            'slug' => 'service-baru',
            'description' => 'Deskripsi service',
            'price' => 175000,
            'visit_type' => 'both',
            'image_path' => null,
            'is_active' => true,
            'is_featured' => false,
        ]);
        $createResponse->assertRedirect(route('admin.services.index'));

        $created = Service::query()->where('slug', 'service-baru')->firstOrFail();

        $updateResponse = $this->actingAs($admin)->patch(route('admin.services.update', $service), [
            'name' => 'Service Diubah',
            'slug' => 'service-diubah',
            'description' => 'Deskripsi service diubah',
            'price' => null,
            'visit_type' => 'office_visit',
            'image_path' => 'images/service.jpg',
            'is_active' => false,
            'is_featured' => true,
        ]);
        $updateResponse->assertRedirect(route('admin.services.index'));

        $deleteResponse = $this->actingAs($admin)->delete(route('admin.services.destroy', $created));
        $deleteResponse->assertRedirect(route('admin.services.index'));

        $this->assertDatabaseHas('services', [
            'id' => $service->id,
            'name' => 'Service Diubah',
            'slug' => 'service-diubah',
        ]);
        $this->assertDatabaseMissing('services', ['id' => $created->id]);
    }

    public function test_service_slug_validation_works_on_create_and_update(): void
    {
        $admin = $this->createAdmin();
        $service = $this->createService(slug: 'unik-service');
        $other = $this->createService(slug: 'service-lain');

        $this->actingAs($admin)->post(route('admin.services.store'), $this->servicePayload(slug: 'unik-service'))
            ->assertSessionHasErrors('slug');

        $this->actingAs($admin)->patch(route('admin.services.update', $other), $this->servicePayload(slug: 'unik-service'))
            ->assertSessionHasErrors('slug');

        $this->actingAs($admin)->patch(route('admin.services.update', $service), $this->servicePayload(slug: 'unik-service'))
            ->assertSessionHasNoErrors();
    }

    private function createAdmin(): User
    {
        return User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);
    }

    private function createCategory(?string $slug = null): ProductCategory
    {
        $index = ProductCategory::query()->count();

        return ProductCategory::query()->create([
            'name' => 'Kategori '.$index,
            'slug' => $slug ?? 'kategori-'.$index,
            'description' => 'Deskripsi kategori',
            'is_active' => true,
        ]);
    }

    private function createProduct(ProductCategory $category, ?string $slug = null): Product
    {
        $index = Product::query()->count();

        return Product::query()->create([
            'product_category_id' => $category->id,
            'name' => 'Produk '.$index,
            'slug' => $slug ?? 'produk-'.$index,
            'price' => 100000,
            'short_description' => 'Singkat',
            'full_description' => 'Lengkap',
            'benefits' => 'Manfaat',
            'usage_rules' => 'Aturan',
            'notes' => 'Catatan',
            'image_path' => null,
            'stock_quantity' => 10,
            'low_stock_threshold' => 1,
            'is_active' => true,
            'is_featured' => false,
        ]);
    }

    private function createService(?string $slug = null): Service
    {
        $index = Service::query()->count();

        return Service::query()->create([
            'name' => 'Service '.$index,
            'slug' => $slug ?? 'service-'.$index,
            'description' => 'Deskripsi service',
            'price' => 150000,
            'visit_type' => 'home_visit',
            'image_path' => null,
            'is_active' => true,
            'is_featured' => false,
        ]);
    }

    private function productPayload(int $categoryId, ?string $slug = null): array
    {
        return [
            'product_category_id' => $categoryId,
            'name' => 'Produk Valid',
            'slug' => $slug ?? 'produk-valid',
            'price' => 100000,
            'short_description' => 'Singkat',
            'full_description' => 'Lengkap',
            'benefits' => null,
            'usage_rules' => null,
            'notes' => null,
            'image_path' => null,
            'stock_quantity' => 10,
            'low_stock_threshold' => 1,
            'is_active' => true,
            'is_featured' => false,
        ];
    }

    private function servicePayload(?string $slug = null): array
    {
        return [
            'name' => 'Service Valid',
            'slug' => $slug ?? 'service-valid',
            'description' => 'Deskripsi service',
            'price' => 150000,
            'visit_type' => 'both',
            'image_path' => null,
            'is_active' => true,
            'is_featured' => false,
        ];
    }
}
