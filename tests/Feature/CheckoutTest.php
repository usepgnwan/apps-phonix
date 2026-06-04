<?php

namespace Tests\Feature;

use App\Models\CustomerProfile;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_checkout_creates_order_items_and_clears_cart(): void
    {
        $product = $this->createProduct(price: 125000, stockQuantity: 5);
        $this->post(route('cart.items.store'), [
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $response = $this->post(route('checkout.store'), [
            'customer_name' => 'Guest Customer',
            'customer_whatsapp_number' => '08123456789',
            'shipping_address' => 'Jl. Guest Herbal No. 2',
        ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('cart.index'));

        $this->assertDatabaseHas('orders', [
            'user_id' => null,
            'customer_profile_id' => null,
            'customer_name' => 'Guest Customer',
            'subtotal' => 250000,
            'voucher_discount_amount' => 0,
            'shipping_cost' => 0,
            'total' => 250000,
            'shipping_status' => 'pending_shipping_confirmation',
            'payment_status' => 'pending',
            'status' => 'waiting_shipping_confirmation',
        ]);
        $this->assertDatabaseHas('order_items', [
            'product_id' => $product->id,
            'product_name' => $product->name,
            'unit_price' => 125000,
            'quantity' => 2,
            'line_total' => 250000,
        ]);
        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_member_checkout_with_valid_voucher_creates_redemption(): void
    {
        [$user, $profile] = $this->createCustomer(memberStatus: 'member');
        $product = $this->createProduct(price: 200000, stockQuantity: 5);
        $voucher = $this->createVoucher([
            'code' => 'MEMBER50',
            'discount_type' => 'fixed',
            'discount_value' => 50000,
            'minimum_purchase' => 100000,
        ]);

        $this->actingAs($user)->post(route('cart.items.store'), [
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $response = $this->actingAs($user)->post(route('checkout.store'), [
            'customer_name' => $profile->name,
            'customer_whatsapp_number' => $profile->whatsapp_number,
            'shipping_address' => $profile->primary_address,
            'voucher_code' => 'MEMBER50',
        ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('cart.index'));

        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'customer_profile_id' => $profile->id,
            'voucher_id' => $voucher->id,
            'subtotal' => 200000,
            'voucher_discount_amount' => 50000,
            'total' => 150000,
        ]);
        $this->assertDatabaseHas('voucher_redemptions', [
            'voucher_id' => $voucher->id,
            'customer_profile_id' => $profile->id,
            'discount_amount' => 50000,
        ]);
        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_guest_checkout_with_voucher_is_rejected(): void
    {
        $product = $this->createProduct(price: 100000);
        $this->createVoucher(['code' => 'MEMBERONLY']);
        $this->post(route('cart.items.store'), [
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $response = $this->post(route('checkout.store'), [
            'customer_name' => 'Guest Customer',
            'customer_whatsapp_number' => '08123456789',
            'shipping_address' => 'Jl. Guest Herbal No. 2',
            'voucher_code' => 'MEMBERONLY',
        ]);

        $response->assertSessionHasErrors('voucher_code');
        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('voucher_redemptions', 0);
    }

    public function test_non_member_checkout_with_voucher_is_rejected(): void
    {
        [$user, $profile] = $this->createCustomer(memberStatus: 'non_member');
        $product = $this->createProduct(price: 100000);
        $this->createVoucher(['code' => 'MEMBERONLY']);

        $this->actingAs($user)->post(route('cart.items.store'), [
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $response = $this->actingAs($user)->post(route('checkout.store'), [
            'customer_name' => $profile->name,
            'customer_whatsapp_number' => $profile->whatsapp_number,
            'shipping_address' => $profile->primary_address,
            'voucher_code' => 'MEMBERONLY',
        ]);

        $response->assertSessionHasErrors('voucher_code');
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_empty_cart_checkout_is_rejected(): void
    {
        $response = $this->post(route('checkout.store'), [
            'customer_name' => 'Guest Customer',
            'customer_whatsapp_number' => '08123456789',
            'shipping_address' => 'Jl. Guest Herbal No. 2',
        ]);

        $response->assertSessionHasErrors('cart');
        $this->assertDatabaseCount('orders', 0);
    }

    private function createProduct(float $price = 100000, int $stockQuantity = 10): Product
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
            'price' => $price,
            'short_description' => 'Deskripsi singkat produk herbal.',
            'full_description' => 'Deskripsi lengkap produk herbal.',
            'stock_quantity' => $stockQuantity,
            'low_stock_threshold' => 1,
            'is_active' => true,
            'is_featured' => false,
        ]);
    }

    private function createCustomer(string $memberStatus): array
    {
        $user = User::factory()->create();
        $profile = CustomerProfile::query()->create([
            'user_id' => $user->id,
            'name' => 'Phoenix Customer',
            'whatsapp_number' => '08123456789',
            'primary_address' => 'Jl. Herbal No. 1',
            'member_status' => $memberStatus,
        ]);

        return [$user, $profile];
    }

    private function createVoucher(array $attributes = []): Voucher
    {
        return Voucher::query()->create(array_merge([
            'code' => 'MEMBER10',
            'name' => 'Voucher Member',
            'discount_type' => 'percentage',
            'discount_value' => 10,
            'minimum_purchase' => null,
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addDay(),
            'usage_limit' => 10,
            'is_published' => true,
        ], $attributes));
    }
}
