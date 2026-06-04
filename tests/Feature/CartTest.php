<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\CustomerProfile;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CartTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_add_active_product_to_session_cart(): void
    {
        $product = $this->createProduct(stockQuantity: 5);

        $response = $this->post(route('cart.items.store'), [
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        $cart = Cart::query()->firstOrFail();

        $this->assertNull($cart->user_id);
        $this->assertNotNull($cart->session_id);
        $this->assertDatabaseHas('cart_items', [
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);
    }

    public function test_logged_in_user_can_add_product_to_customer_cart(): void
    {
        $user = User::factory()->create();
        $profile = CustomerProfile::query()->create([
            'user_id' => $user->id,
            'name' => 'Phoenix Customer',
            'whatsapp_number' => '08123456789',
            'primary_address' => 'Jl. Herbal No. 1',
            'member_status' => 'non_member',
        ]);
        $product = $this->createProduct(stockQuantity: 5);

        $response = $this
            ->actingAs($user)
            ->post(route('cart.items.store'), [
                'product_id' => $product->id,
                'quantity' => 1,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        $this->assertDatabaseHas('carts', [
            'user_id' => $user->id,
            'customer_profile_id' => $profile->id,
            'session_id' => null,
        ]);
    }

    public function test_adding_same_product_increments_existing_cart_item(): void
    {
        $product = $this->createProduct(stockQuantity: 5);

        $this->post(route('cart.items.store'), [
            'product_id' => $product->id,
            'quantity' => 1,
        ]);
        $this->post(route('cart.items.store'), [
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $this->assertSame(1, CartItem::query()->count());
        $this->assertDatabaseHas('cart_items', [
            'product_id' => $product->id,
            'quantity' => 3,
        ]);
    }

    public function test_cart_quantity_cannot_exceed_stock(): void
    {
        $product = $this->createProduct(stockQuantity: 2);

        $response = $this->post(route('cart.items.store'), [
            'product_id' => $product->id,
            'quantity' => 3,
        ]);

        $response->assertSessionHasErrors('quantity');
        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_inactive_product_cannot_be_added_to_cart(): void
    {
        $product = $this->createProduct(isActive: false);

        $response = $this->post(route('cart.items.store'), [
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $response->assertSessionHasErrors('product_id');
        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_cart_item_quantity_can_be_updated(): void
    {
        $product = $this->createProduct(stockQuantity: 5);
        $this->post(route('cart.items.store'), [
            'product_id' => $product->id,
            'quantity' => 1,
        ]);
        $cartItem = CartItem::query()->firstOrFail();

        $response = $this->patch(route('cart.items.update', $cartItem), [
            'quantity' => 4,
        ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect();
        $this->assertDatabaseHas('cart_items', [
            'id' => $cartItem->id,
            'quantity' => 4,
        ]);
    }

    public function test_cart_item_can_be_removed(): void
    {
        $product = $this->createProduct();
        $this->post(route('cart.items.store'), [
            'product_id' => $product->id,
            'quantity' => 1,
        ]);
        $cartItem = CartItem::query()->firstOrFail();

        $response = $this->delete(route('cart.items.destroy', $cartItem));

        $response->assertRedirect();
        $this->assertDatabaseMissing('cart_items', [
            'id' => $cartItem->id,
        ]);
    }

    private function createProduct(int $stockQuantity = 10, bool $isActive = true): Product
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
            'stock_quantity' => $stockQuantity,
            'low_stock_threshold' => 1,
            'is_active' => $isActive,
            'is_featured' => false,
        ]);
    }
}
