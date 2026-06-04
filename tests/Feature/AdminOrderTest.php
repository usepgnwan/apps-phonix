<?php

namespace Tests\Feature;

use App\Models\CustomerProfile;
use App\Models\Order;
use App\Models\PaymentMethod;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use App\Models\Voucher;
use App\Models\VoucherRedemption;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminOrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_admin_orders_index(): void
    {
        $this->get(route('admin.orders.index'))->assertRedirect(route('login'));
    }

    public function test_authenticated_non_admin_gets_forbidden(): void
    {
        $user = User::factory()->create(['role' => 'customer', 'is_active' => true]);

        $this->actingAs($user)->get(route('admin.orders.index'))->assertForbidden();
    }

    public function test_active_admin_can_view_index_placeholder(): void
    {
        $admin = $this->createAdmin();
        $this->createOrder();

        $this->actingAs($admin)->withHeader('X-Inertia', 'true')->get(route('admin.orders.index'))
            ->assertOk()
            ->assertJsonPath('component', 'Welcome')
            ->assertJsonPath('props.page', 'admin.orders.index')
            ->assertJsonStructure(['props' => ['orders']]);
    }

    public function test_active_admin_can_view_show_placeholder_with_relations(): void
    {
        $admin = $this->createAdmin();
        $order = $this->createOrder(withRelations: true);

        $this->actingAs($admin)->withHeader('X-Inertia', 'true')->get(route('admin.orders.show', $order))
            ->assertOk()
            ->assertJsonPath('component', 'Welcome')
            ->assertJsonPath('props.page', 'admin.orders.show')
            ->assertJsonStructure([
                'props' => [
                    'order' => [
                        'user',
                        'customer_profile',
                        'voucher',
                        'payment_method',
                        'order_items',
                        'voucher_redemption',
                    ],
                    'paymentMethods',
                ],
            ]);
    }

    public function test_shipping_update_persists_fields_and_recalculates_total(): void
    {
        $admin = $this->createAdmin();
        $order = $this->createOrder();

        $response = $this->actingAs($admin)->patch(route('admin.orders.shipping.update', $order), [
            'courier_name' => 'JNE',
            'tracking_number' => 'AWB123',
            'shipping_cost' => 15000,
            'shipping_status' => 'ready_to_ship',
            'shipping_notes' => 'Siap kirim',
        ]);

        $response->assertRedirect(route('admin.orders.show', $order));

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'courier_name' => 'JNE',
            'tracking_number' => 'AWB123',
            'shipping_cost' => 15000,
            'shipping_status' => 'ready_to_ship',
            'shipping_notes' => 'Siap kirim',
            'total' => 105000,
            'status' => 'waiting_payment',
        ]);
    }

    public function test_payment_update_persists_fields_and_sets_received_timestamp(): void
    {
        $admin = $this->createAdmin();
        $paymentMethod = $this->createPaymentMethod();
        $order = $this->createOrder();

        $response = $this->actingAs($admin)->patch(route('admin.orders.payment.update', $order), [
            'payment_method_id' => $paymentMethod->id,
            'payment_status' => 'paid',
            'payment_notes' => 'Lunas',
        ]);

        $response->assertRedirect(route('admin.orders.show', $order));

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'payment_method_id' => $paymentMethod->id,
            'payment_status' => 'paid',
            'payment_notes' => 'Lunas',
            'status' => 'payment_received',
        ]);

        $this->assertNotNull($order->fresh()->payment_received_at);
    }

    public function test_status_update_persists_only_status_and_admin_notes(): void
    {
        $admin = $this->createAdmin();
        $order = $this->createOrder();

        $response = $this->actingAs($admin)->patch(route('admin.orders.status.update', $order), [
            'status' => 'processing',
            'admin_notes' => 'Diproses',
        ]);

        $response->assertRedirect(route('admin.orders.show', $order));

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'processing',
            'admin_notes' => 'Diproses',
        ]);
    }

    public function test_status_update_to_processing_decrements_order_item_stock_once(): void
    {
        $admin = $this->createAdmin();
        $order = $this->createOrder(itemQuantity: 2, productStock: 10);
        $product = $order->orderItems()->firstOrFail()->product;

        $response = $this->actingAs($admin)->patch(route('admin.orders.status.update', $order), [
            'status' => 'processing',
            'admin_notes' => 'Mulai diproses',
        ]);

        $response->assertRedirect(route('admin.orders.show', $order));

        $this->assertSame(8, $product->fresh()->stock_quantity);
        $this->assertSame('processing', $order->fresh()->status);
        $this->assertNotNull($order->fresh()->stock_decremented_at);
    }

    public function test_repeated_processing_status_update_does_not_decrement_stock_twice(): void
    {
        $admin = $this->createAdmin();
        $order = $this->createOrder(itemQuantity: 2, productStock: 10);
        $product = $order->orderItems()->firstOrFail()->product;

        $this->actingAs($admin)->patch(route('admin.orders.status.update', $order), [
            'status' => 'processing',
            'admin_notes' => 'Mulai diproses',
        ])->assertRedirect(route('admin.orders.show', $order));

        $firstStockDecrementedAt = $order->fresh()->stock_decremented_at;

        $this->actingAs($admin)->patch(route('admin.orders.status.update', $order), [
            'status' => 'processing',
            'admin_notes' => 'Tetap diproses',
        ])->assertRedirect(route('admin.orders.show', $order));

        $this->assertSame(8, $product->fresh()->stock_quantity);
        $this->assertTrue($firstStockDecrementedAt->equalTo($order->fresh()->stock_decremented_at));
    }

    public function test_payment_update_to_paid_does_not_decrement_stock(): void
    {
        $admin = $this->createAdmin();
        $paymentMethod = $this->createPaymentMethod();
        $order = $this->createOrder(itemQuantity: 2, productStock: 10);
        $product = $order->orderItems()->firstOrFail()->product;

        $response = $this->actingAs($admin)->patch(route('admin.orders.payment.update', $order), [
            'payment_method_id' => $paymentMethod->id,
            'payment_status' => 'paid',
            'payment_notes' => 'Lunas',
        ]);

        $response->assertRedirect(route('admin.orders.show', $order));

        $this->assertSame(10, $product->fresh()->stock_quantity);
        $this->assertSame('payment_received', $order->fresh()->status);
        $this->assertNull($order->fresh()->stock_decremented_at);
    }

    public function test_status_update_to_processing_fails_when_stock_is_insufficient(): void
    {
        $admin = $this->createAdmin();
        $order = $this->createOrder(itemQuantity: 2, productStock: 1);
        $product = $order->orderItems()->firstOrFail()->product;

        $this->actingAs($admin)->patch(route('admin.orders.status.update', $order), [
            'status' => 'processing',
            'admin_notes' => 'Mulai diproses',
        ])->assertSessionHasErrors('status');

        $this->assertSame(1, $product->fresh()->stock_quantity);
        $this->assertSame('waiting_shipping_confirmation', $order->fresh()->status);
        $this->assertNull($order->fresh()->stock_decremented_at);
    }

    public function test_invalid_shipping_payment_and_order_statuses_are_rejected(): void
    {
        $admin = $this->createAdmin();
        $paymentMethod = $this->createPaymentMethod();
        $order = $this->createOrder();

        $this->actingAs($admin)->patch(route('admin.orders.shipping.update', $order), [
            'courier_name' => null,
            'tracking_number' => null,
            'shipping_cost' => 0,
            'shipping_status' => 'invalid',
            'shipping_notes' => null,
        ])->assertSessionHasErrors('shipping_status');

        $this->actingAs($admin)->patch(route('admin.orders.payment.update', $order), [
            'payment_method_id' => $paymentMethod->id,
            'payment_status' => 'invalid',
            'payment_notes' => null,
        ])->assertSessionHasErrors('payment_status');

        $this->actingAs($admin)->patch(route('admin.orders.status.update', $order), [
            'status' => 'invalid',
            'admin_notes' => null,
        ])->assertSessionHasErrors('status');
    }

    public function test_inactive_payment_method_id_is_rejected(): void
    {
        $admin = $this->createAdmin();
        $order = $this->createOrder();
        $paymentMethod = $this->createPaymentMethod(['is_active' => false]);

        $this->actingAs($admin)->patch(route('admin.orders.payment.update', $order), [
            'payment_method_id' => $paymentMethod->id,
            'payment_status' => 'paid',
            'payment_notes' => null,
        ])->assertSessionHasErrors('payment_method_id');
    }

    private function createAdmin(): User
    {
        return User::factory()->create(['role' => 'admin', 'is_active' => true]);
    }

    private function createPaymentMethod(array $attributes = []): PaymentMethod
    {
        return PaymentMethod::query()->create(array_merge([
            'type' => 'bank_transfer',
            'bank_name' => 'BCA',
            'account_number' => '1234567890',
            'account_holder_name' => 'PT Phoenix',
            'qris_image_path' => null,
            'instructions' => 'Transfer ke rekening',
            'is_active' => true,
        ], $attributes));
    }

    private function createOrder(bool $withRelations = false, int $itemQuantity = 1, int $productStock = 10): Order
    {
        $user = User::factory()->create();
        $profile = CustomerProfile::query()->create([
            'user_id' => $user->id,
            'name' => 'Customer A',
            'whatsapp_number' => '08123456789',
            'primary_address' => 'Alamat A',
            'member_status' => 'member',
        ]);
        $voucher = Voucher::query()->create([
            'code' => 'DISC10',
            'name' => 'Diskon 10',
            'discount_type' => 'fixed',
            'discount_value' => 10000,
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addDay(),
            'usage_limit' => 10,
            'is_published' => true,
        ]);
        $paymentMethod = $this->createPaymentMethod();

        $order = Order::query()->create([
            'order_number' => 'ORD-'.Order::query()->count(),
            'user_id' => $user->id,
            'customer_profile_id' => $profile->id,
            'voucher_id' => $voucher->id,
            'payment_method_id' => $paymentMethod->id,
            'customer_name' => $profile->name,
            'customer_whatsapp_number' => $profile->whatsapp_number,
            'shipping_address' => $profile->primary_address,
            'subtotal' => 100000,
            'voucher_discount_amount' => 10000,
            'shipping_cost' => 0,
            'total' => 90000,
            'shipping_status' => 'pending_shipping_confirmation',
            'payment_status' => 'pending',
            'status' => 'waiting_shipping_confirmation',
        ]);

        $product = $this->createProduct(['stock_quantity' => $productStock]);
        $order->orderItems()->create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'unit_price' => 100000,
            'quantity' => $itemQuantity,
            'line_total' => 100000 * $itemQuantity,
        ]);

        if ($withRelations) {
            VoucherRedemption::query()->create([
                'voucher_id' => $voucher->id,
                'customer_profile_id' => $profile->id,
                'order_id' => $order->id,
                'discount_amount' => 10000,
                'redeemed_at' => now(),
            ]);
        }

        return $order;
    }

    private function createProduct(array $attributes = []): Product
    {
        $category = ProductCategory::query()->create([
            'name' => 'Kategori',
            'slug' => 'kategori-'.ProductCategory::query()->count(),
            'is_active' => true,
        ]);

        return Product::query()->create(array_merge([
            'product_category_id' => $category->id,
            'name' => 'Produk '.Product::query()->count(),
            'slug' => 'produk-'.Product::query()->count(),
            'price' => 100000,
            'short_description' => 'Singkat',
            'full_description' => 'Lengkap',
            'stock_quantity' => 10,
            'low_stock_threshold' => 1,
            'is_active' => true,
            'is_featured' => false,
        ], $attributes));
    }
}
