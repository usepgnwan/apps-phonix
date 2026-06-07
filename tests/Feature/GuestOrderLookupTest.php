<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\PaymentMethod;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GuestOrderLookupTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_order_lookup_form_renders_public_inertia_component(): void
    {
        $response = $this
            ->withHeaders($this->inertiaHeaders())
            ->get(route('orders.lookup.create'));

        $response
            ->assertOk()
            ->assertJsonPath('component', 'Public/Orders/Lookup');
    }

    public function test_guest_can_lookup_order_with_order_number_and_matching_whatsapp(): void
    {
        $order = $this->createOrder(['customer_whatsapp_number' => '0812-3456-7890']);

        $response = $this->post(route('orders.lookup.store'), [
            'order_number' => $order->order_number,
            'customer_whatsapp_number' => '+62 812 3456 7890',
        ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertSessionHas('guest_order_lookup.'.$order->id)
            ->assertRedirect(route('orders.lookup.show', ['order' => $order->order_number]));
    }

    public function test_lookup_rejects_wrong_whatsapp_with_generic_error(): void
    {
        $order = $this->createOrder(['customer_whatsapp_number' => '081234567890']);

        $response = $this->from(route('orders.lookup.create'))->post(route('orders.lookup.store'), [
            'order_number' => $order->order_number,
            'customer_whatsapp_number' => '089999999999',
        ]);

        $response
            ->assertRedirect(route('orders.lookup.create'))
            ->assertSessionHasErrors([
                'order_number' => 'Nomor order atau nomor WhatsApp tidak cocok dengan data kami.',
            ]);
    }

    public function test_lookup_rejects_unknown_order_with_same_generic_error(): void
    {
        $response = $this->from(route('orders.lookup.create'))->post(route('orders.lookup.store'), [
            'order_number' => 'ORD-20260607-UNKNOWN',
            'customer_whatsapp_number' => '081234567890',
        ]);

        $response
            ->assertRedirect(route('orders.lookup.create'))
            ->assertSessionHasErrors([
                'order_number' => 'Nomor order atau nomor WhatsApp tidak cocok dengan data kami.',
            ]);
    }

    public function test_guest_order_show_requires_prior_lookup_session(): void
    {
        $order = $this->createOrder();

        $response = $this->get(route('orders.lookup.show', ['order' => $order->order_number]));

        $response
            ->assertRedirect(route('orders.lookup.create'))
            ->assertSessionHas('error', 'Masukkan nomor order dan nomor WhatsApp untuk melihat transaksi.');
    }

    public function test_guest_order_show_renders_safe_public_order_payload_after_lookup(): void
    {
        $product = $this->createProduct();
        $order = $this->createOrder([
            'admin_notes' => 'Catatan internal admin.',
            'user_id' => null,
            'customer_profile_id' => null,
        ]);
        $order->orderItems()->create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'unit_price' => 125000,
            'quantity' => 2,
            'line_total' => 250000,
        ]);

        $response = $this
            ->withSession(['guest_order_lookup.'.$order->id => true])
            ->withHeaders($this->inertiaHeaders())
            ->get(route('orders.lookup.show', ['order' => $order->order_number]));

        $response
            ->assertOk()
            ->assertJsonPath('component', 'Public/Orders/Show')
            ->assertJsonPath('props.order.order_number', $order->order_number)
            ->assertJsonPath('props.order.customer_name', $order->customer_name)
            ->assertJsonPath('props.order.order_items.0.product_name', $product->name)
            ->assertJsonMissingPath('props.order.admin_notes')
            ->assertJsonMissingPath('props.order.user_id')
            ->assertJsonMissingPath('props.order.customer_profile_id');
    }

    public function test_guest_order_show_includes_payment_method_when_waiting_payment(): void
    {
        $paymentMethod = $this->createPaymentMethod();
        $order = $this->createOrder([
            'payment_method_id' => $paymentMethod->id,
            'shipping_cost' => 15000,
            'total' => 265000,
            'shipping_status' => 'shipping_cost_confirmed',
            'payment_status' => 'waiting_payment',
            'status' => 'waiting_payment',
        ]);

        $response = $this
            ->withSession(['guest_order_lookup.'.$order->id => true])
            ->withHeaders($this->inertiaHeaders())
            ->get(route('orders.lookup.show', ['order' => $order->order_number]));

        $response
            ->assertOk()
            ->assertJsonPath('props.order.payment_method.type', 'bank_transfer')
            ->assertJsonPath('props.order.payment_method.bank_name', 'BCA')
            ->assertJsonPath('props.order.payment_method.account_number', '1234567890')
            ->assertJsonPath('props.order.payment_method.account_holder_name', 'PT Phoenix')
            ->assertJsonPath('props.order.payment_method.instructions', 'Transfer ke rekening Phoenix.');
    }

    public function test_guest_order_show_hides_payment_method_after_payment_is_paid(): void
    {
        $paymentMethod = $this->createPaymentMethod();
        $order = $this->createOrder([
            'payment_method_id' => $paymentMethod->id,
            'payment_status' => 'paid',
            'status' => 'payment_received',
        ]);

        $response = $this
            ->withSession(['guest_order_lookup.'.$order->id => true])
            ->withHeaders($this->inertiaHeaders())
            ->get(route('orders.lookup.show', ['order' => $order->order_number]));

        $response
            ->assertOk()
            ->assertJsonPath('props.order.status', 'payment_received')
            ->assertJsonPath('props.order.payment_status', 'paid')
            ->assertJsonPath('props.order.payment_method', null);
    }

    private function createOrder(array $attributes = []): Order
    {
        return Order::query()->create(array_merge([
            'order_number' => 'ORD-20260607-'.str_pad((string) (Order::query()->count() + 1), 6, '0', STR_PAD_LEFT),
            'customer_name' => 'Guest Customer',
            'customer_whatsapp_number' => '081234567890',
            'shipping_address' => 'Jl. Herbal No. 1',
            'subtotal' => 250000,
            'voucher_discount_amount' => 0,
            'shipping_cost' => 0,
            'total' => 250000,
            'shipping_status' => 'pending_shipping_confirmation',
            'payment_status' => 'pending',
            'status' => 'waiting_shipping_confirmation',
        ], $attributes));
    }

    private function createPaymentMethod(array $attributes = []): PaymentMethod
    {
        return PaymentMethod::query()->create(array_merge([
            'type' => 'bank_transfer',
            'bank_name' => 'BCA',
            'account_number' => '1234567890',
            'account_holder_name' => 'PT Phoenix',
            'qris_image_path' => null,
            'instructions' => 'Transfer ke rekening Phoenix.',
            'is_active' => true,
        ], $attributes));
    }

    private function createProduct(): Product
    {
        $category = ProductCategory::query()->create([
            'name' => 'Herbal',
            'slug' => 'herbal',
            'is_active' => true,
        ]);

        return Product::query()->create([
            'product_category_id' => $category->id,
            'name' => 'Produk Herbal',
            'slug' => 'produk-herbal',
            'price' => 125000,
            'short_description' => 'Deskripsi singkat produk herbal.',
            'full_description' => 'Deskripsi lengkap produk herbal.',
            'stock_quantity' => 10,
            'low_stock_threshold' => 1,
            'is_active' => true,
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
