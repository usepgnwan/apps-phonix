<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\BranchProductStock;
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

    public function test_cart_index_renders_public_cart_inertia_component(): void
    {
        [$product, $branch] = $this->createProductWithBranchStock();
        $this->post(route('cart.items.store'), [
            'product_id' => $product->id,
            'quantity' => 1,
            'branch_id' => $branch->id,
        ]);

        $response = $this->withHeaders($this->inertiaHeaders())->get(route('cart.index'));

        $response
            ->assertOk()
            ->assertJsonPath('component', 'Public/Cart/Index')
            ->assertJsonPath('props.cart.cart_items.0.product_id', $product->id);
    }

    public function test_cart_index_shares_cart_item_quantity_count(): void
    {
        [$product, $branch] = $this->createProductWithBranchStock(stockQuantity: 5);

        $this->post(route('cart.items.store'), [
            'product_id' => $product->id,
            'quantity' => 3,
            'branch_id' => $branch->id,
        ]);

        $response = $this->withHeaders($this->inertiaHeaders())->get(route('cart.index'));

        $response
            ->assertOk()
            ->assertJsonPath('props.cartSummary.count', 3);
    }

    public function test_guest_can_add_active_product_to_session_cart(): void
    {
        [$product, $branch] = $this->createProductWithBranchStock(stockQuantity: 5);

        $response = $this->post(route('cart.items.store'), [
            'product_id' => $product->id,
            'quantity' => 2,
            'branch_id' => $branch->id,
        ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        $cart = Cart::query()->firstOrFail();

        $this->assertNull($cart->user_id);
        $this->assertNotNull($cart->session_id);
        $this->assertSame($branch->id, $cart->branch_id);
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
        [$product, $branch] = $this->createProductWithBranchStock(stockQuantity: 5);

        $response = $this->actingAs($user)->post(route('cart.items.store'), [
            'product_id' => $product->id,
            'quantity' => 1,
            'branch_id' => $branch->id,
        ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        $cart = Cart::query()->where('user_id', $user->id)->firstOrFail();

        $this->assertSame($profile->id, $cart->customer_profile_id);
        $this->assertDatabaseHas('cart_items', [
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);
    }

    public function test_adding_same_product_increments_existing_cart_item(): void
    {
        [$product, $branch] = $this->createProductWithBranchStock(stockQuantity: 5);

        $this->post(route('cart.items.store'), [
            'product_id' => $product->id,
            'quantity' => 1,
            'branch_id' => $branch->id,
        ])->assertSessionHasNoErrors();

        $this->post(route('cart.items.store'), [
            'product_id' => $product->id,
            'quantity' => 2,
            'branch_id' => $branch->id,
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseCount('cart_items', 1);
        $this->assertDatabaseHas('cart_items', [
            'product_id' => $product->id,
            'quantity' => 3,
        ]);
    }

    public function test_cart_quantity_cannot_exceed_stock(): void
    {
        [$product, $branch] = $this->createProductWithBranchStock(stockQuantity: 2);

        $response = $this->post(route('cart.items.store'), [
            'product_id' => $product->id,
            'quantity' => 3,
            'branch_id' => $branch->id,
        ]);

        $response->assertSessionHasErrors('quantity');
        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_inactive_product_cannot_be_added_to_cart(): void
    {
        [$product, $branch] = $this->createProductWithBranchStock(isActive: false);

        $response = $this->post(route('cart.items.store'), [
            'product_id' => $product->id,
            'quantity' => 1,
            'branch_id' => $branch->id,
        ]);

        $response->assertSessionHasErrors('product_id');
        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_cart_item_quantity_can_be_updated(): void
    {
        [$product, $branch] = $this->createProductWithBranchStock(stockQuantity: 5);

        $this->post(route('cart.items.store'), [
            'product_id' => $product->id,
            'quantity' => 1,
            'branch_id' => $branch->id,
        ])->assertSessionHasNoErrors();

        $cartItem = CartItem::query()->firstOrFail();

        $response = $this->patch(route('cart.items.update', $cartItem), [
            'quantity' => 3,
        ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        $this->assertDatabaseHas('cart_items', [
            'id' => $cartItem->id,
            'quantity' => 3,
        ]);
    }

    public function test_cart_item_can_be_removed(): void
    {
        [$product, $branch] = $this->createProductWithBranchStock();

        $this->post(route('cart.items.store'), [
            'product_id' => $product->id,
            'quantity' => 1,
            'branch_id' => $branch->id,
        ])->assertSessionHasNoErrors();

        $cartItem = CartItem::query()->firstOrFail();

        $response = $this->delete(route('cart.items.destroy', $cartItem));

        $response->assertRedirect();
        $this->assertDatabaseMissing('cart_items', [
            'id' => $cartItem->id,
        ]);
    }

    public function test_add_to_cart_requires_branch_id(): void
    {
        [$product] = $this->createProductWithBranchStock();

        $response = $this->post(route('cart.items.store'), [
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $response->assertSessionHasErrors('branch_id');
        $this->assertDatabaseCount('cart_items', 0);
    }

    /**
     * @return array{0: Product, 1: Branch}
     */
    private function createProductWithBranchStock(int $stockQuantity = 10, bool $isActive = true): array
    {
        $branch = Branch::query()->create([
            'name' => 'Pusat',
            'slug' => 'pusat-'.Branch::query()->count(),
            'code' => 'P'.Branch::query()->count(),
            'is_active' => true,
        ]);

        $category = ProductCategory::query()->create([
            'name' => 'Herbal',
            'slug' => 'herbal-'.ProductCategory::query()->count(),
            'is_active' => true,
        ]);

        $product = Product::query()->create([
            'product_category_id' => $category->id,
            'name' => 'Produk Herbal '.Product::query()->count(),
            'slug' => 'produk-herbal-'.Product::query()->count(),
            'price' => 100000,
            'short_description' => 'Deskripsi singkat produk herbal.',
            'full_description' => 'Deskripsi lengkap produk herbal.',
            'is_active' => $isActive,
            'is_featured' => false,
        ]);

        BranchProductStock::query()->create([
            'branch_id' => $branch->id,
            'product_id' => $product->id,
            'stock_quantity' => $stockQuantity,
            'low_stock_threshold' => 1,
        ]);

        return [$product, $branch];
    }

    public function test_buy_now_does_not_add_item_to_regular_cart(): void
    {
        [$product, $branch] = $this->createProductWithBranchStock(stockQuantity: 5);
        [$existingProduct, $sameBranch] = $this->createProductWithBranchStock(stockQuantity: 5);

        $this->post(route('cart.items.store'), [
            'product_id' => $existingProduct->id,
            'quantity' => 1,
            'branch_id' => $sameBranch->id,
        ])->assertSessionHasNoErrors();

        $this->post(route('checkout.buy-now'), [
            'product_id' => $product->id,
            'quantity' => 2,
            'branch_id' => $branch->id,
        ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('checkout.show'));

        $mainCart = Cart::query()
            ->where(function ($query): void {
                $query->whereNull('session_id')
                    ->orWhere('session_id', 'not like', 'buy_now:%');
            })
            ->whereNotNull('session_id')
            ->first();

        $this->assertNotNull($mainCart);
        $this->assertDatabaseHas('cart_items', [
            'cart_id' => $mainCart->id,
            'product_id' => $existingProduct->id,
            'quantity' => 1,
        ]);
        $this->assertDatabaseMissing('cart_items', [
            'cart_id' => $mainCart->id,
            'product_id' => $product->id,
        ]);

        $this->withHeaders($this->inertiaHeaders())
            ->get(route('checkout.show'))
            ->assertOk()
            ->assertJsonPath('component', 'Public/Checkout/Show')
            ->assertJsonPath('props.checkoutSource', 'buy_now')
            ->assertJsonPath('props.cart.cart_items.0.product_id', $product->id)
            ->assertJsonPath('props.cart.cart_items.0.quantity', 2)
            ->assertJsonCount(1, 'props.cart.cart_items');

        $this->withHeaders($this->inertiaHeaders())
            ->get(route('cart.index'))
            ->assertOk()
            ->assertJsonPath('props.cart.cart_items.0.product_id', $existingProduct->id)
            ->assertJsonCount(1, 'props.cart.cart_items')
            ->assertJsonPath('props.cartSummary.count', 1);
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
