<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\CustomerProfile;
use App\Models\Examination;
use App\Models\Order;
use App\Models\PaymentMethod;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductRecommendation;
use App\Models\Service;
use App\Models\User;
use App\Models\Voucher;
use App\Models\VoucherRedemption;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_customer_dashboard(): void
    {
        $response = $this->get(route('customer.dashboard.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_customer_without_profile_is_redirected_from_dashboard(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('customer.dashboard.index'));

        $response
            ->assertRedirect(route('customer.profile.create'))
            ->assertSessionHas('error');
    }

    public function test_customer_dashboard_returns_scoped_summary_counts(): void
    {
        [$user, $profile] = $this->createCustomer('customer@example.com');
        [$otherUser, $otherProfile] = $this->createCustomer('other@example.com');

        $this->createOrderFor($user, $profile);
        $this->createBookingFor($user, $profile);
        $voucher = $this->createVoucher();
        $order = Order::query()->where('customer_profile_id', $profile->id)->firstOrFail();
        VoucherRedemption::query()->create([
            'voucher_id' => $voucher->id,
            'customer_profile_id' => $profile->id,
            'order_id' => $order->id,
            'discount_amount' => 10000,
            'redeemed_at' => now(),
        ]);
        $examination = $this->createExaminationFor($profile);
        $this->createRecommendationFor($profile, $examination);

        $this->createOrderFor($otherUser, $otherProfile);
        $this->createBookingFor($otherUser, $otherProfile);
        $this->createExaminationFor($otherProfile);

        $response = $this->inertiaGet($user, route('customer.dashboard.index'));

        $response
            ->assertOk()
            ->assertJsonPath('component', 'Customer/Dashboard/Index')
            ->assertJsonPath('props.page', 'customer.dashboard.index')
            ->assertJsonPath('props.summary.ordersCount', 1)
            ->assertJsonPath('props.summary.bookingsCount', 1)
            ->assertJsonPath('props.summary.voucherRedemptionsCount', 1)
            ->assertJsonPath('props.summary.examinationsCount', 1)
            ->assertJsonPath('props.summary.productRecommendationsCount', 1);
    }


    public function test_customer_dashboard_returns_active_catalog_recommendation_props(): void
    {
        [$user] = $this->createCustomer('customer@example.com');

        $featuredProduct = $this->createProduct(['name' => 'Produk Unggulan', 'slug' => 'produk-unggulan', 'is_featured' => true]);
        $generalProduct = $this->createProduct(['name' => 'Produk Umum', 'slug' => 'produk-umum', 'is_featured' => false]);
        $inactiveProduct = $this->createProduct(['name' => 'Produk Nonaktif', 'slug' => 'produk-nonaktif', 'is_active' => false, 'is_featured' => true]);
        $featuredService = $this->createService(['name' => 'Layanan Unggulan', 'slug' => 'layanan-unggulan', 'is_featured' => true]);
        $generalService = $this->createService(['name' => 'Layanan Umum', 'slug' => 'layanan-umum', 'is_featured' => false]);
        $inactiveService = $this->createService(['name' => 'Layanan Nonaktif', 'slug' => 'layanan-nonaktif', 'is_active' => false, 'is_featured' => true]);

        $response = $this->inertiaGet($user, route('customer.dashboard.index'));

        $response
            ->assertOk()
            ->assertJsonPath('props.generalProductRecommendations.0.id', $featuredProduct->id)
            ->assertJsonPath('props.generalProductRecommendations.1.id', $generalProduct->id)
            ->assertJsonPath('props.featuredServiceRecommendation.0.id', $featuredService->id)
            ->assertJsonPath('props.miniCatalog.products.0.id', $featuredProduct->id)
            ->assertJsonPath('props.miniCatalog.products.1.id', $generalProduct->id)
            ->assertJsonPath('props.miniCatalog.services.0.id', $featuredService->id)
            ->assertJsonPath('props.miniCatalog.services.1.id', $generalService->id)
            ->assertJsonMissing(['id' => $inactiveProduct->id])
            ->assertJsonMissing(['id' => $inactiveService->id]);
    }

    public function test_customer_can_view_own_order_detail_page(): void
    {
        [$user, $profile] = $this->createCustomer('customer@example.com');
        $order = $this->createOrderFor($user, $profile);
        $paymentMethod = $this->createPaymentMethod();
        $order->update([
            'payment_method_id' => $paymentMethod->id,
            'shipping_cost' => 15000,
            'total' => 115000,
            'shipping_status' => 'shipping_cost_confirmed',
            'status' => 'waiting_payment',
        ]);

        $response = $this->inertiaGet($user, route('customer.dashboard.orders.show', $order));

        $response
            ->assertOk()
            ->assertJsonPath('component', 'Customer/Dashboard/Orders/Show')
            ->assertJsonPath('props.page', 'customer.dashboard.orders.show')
            ->assertJsonPath('props.order.id', $order->id)
            ->assertJsonPath('props.order.payment_method.id', $paymentMethod->id)
            ->assertJsonPath('props.order.payment_method.type', 'bank_transfer')
            ->assertJsonPath('props.order.payment_method.bank_name', 'BCA')
            ->assertJsonPath('props.order.payment_method.account_number', '1234567890')
            ->assertJsonPath('props.order.payment_method.account_holder_name', 'PT Phoenix')
            ->assertJsonPath('props.order.payment_method.instructions', 'Transfer ke rekening Phoenix.');
    }

    public function test_customer_cannot_view_another_customers_order(): void
    {
        [$owner, $ownerProfile] = $this->createCustomer('owner@example.com');
        [$otherUser] = $this->createCustomer('other@example.com');
        $order = $this->createOrderFor($owner, $ownerProfile);

        $response = $this->inertiaGet($otherUser, route('customer.dashboard.orders.show', $order));

        $response->assertNotFound();
    }

    public function test_customer_can_view_own_booking_detail_page(): void
    {
        [$user, $profile] = $this->createCustomer('customer@example.com');
        $booking = $this->createBookingFor($user, $profile);

        $response = $this->inertiaGet($user, route('customer.dashboard.bookings.show', $booking));

        $response
            ->assertOk()
            ->assertJsonPath('component', 'Customer/Dashboard/Bookings/Show')
            ->assertJsonPath('props.page', 'customer.dashboard.bookings.show')
            ->assertJsonPath('props.booking.id', $booking->id);
    }

    public function test_customer_cannot_view_another_customers_booking_from_dashboard(): void
    {
        [$owner, $ownerProfile] = $this->createCustomer('owner@example.com');
        [$otherUser] = $this->createCustomer('other@example.com');
        $booking = $this->createBookingFor($owner, $ownerProfile);

        $response = $this->inertiaGet($otherUser, route('customer.dashboard.bookings.show', $booking));

        $response->assertNotFound();
    }

    private function createCustomer(string $email): array
    {
        $user = User::factory()->create(['email' => $email]);
        $profile = CustomerProfile::query()->create([
            'user_id' => $user->id,
            'name' => 'Phoenix Customer',
            'whatsapp_number' => '08123456789',
            'primary_address' => 'Jl. Herbal No. 1',
            'member_status' => 'member',
        ]);

        return [$user, $profile];
    }

    private function inertiaGet(User $user, string $url)
    {
        $headers = ['X-Inertia' => 'true'];

        if (file_exists(public_path('build/manifest.json'))) {
            $headers['X-Inertia-Version'] = hash_file('xxh128', public_path('build/manifest.json'));
        }

        return $this->actingAs($user)->withHeaders($headers)->get($url);
    }

    private function createOrderFor(User $user, CustomerProfile $profile): Order
    {
        $order = Order::query()->create([
            'order_number' => 'ORD-TEST-'.Order::query()->count(),
            'user_id' => $user->id,
            'customer_profile_id' => $profile->id,
            'customer_name' => $profile->name,
            'customer_whatsapp_number' => $profile->whatsapp_number,
            'shipping_address' => $profile->primary_address,
            'subtotal' => 100000,
            'voucher_discount_amount' => 0,
            'shipping_cost' => 0,
            'total' => 100000,
            'shipping_status' => 'pending_shipping_confirmation',
            'payment_status' => 'pending',
            'status' => 'waiting_shipping_confirmation',
        ]);

        $product = $this->createProduct();
        $order->orderItems()->create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'unit_price' => 100000,
            'quantity' => 1,
            'line_total' => 100000,
        ]);

        return $order;
    }

    private function createBookingFor(User $user, CustomerProfile $profile): Booking
    {
        $service = $this->createService();

        return Booking::query()->create([
            'booking_number' => 'BK-TEST-'.Booking::query()->count(),
            'user_id' => $user->id,
            'customer_profile_id' => $profile->id,
            'service_id' => $service->id,
            'name' => $profile->name,
            'whatsapp_number' => $profile->whatsapp_number,
            'visit_type' => 'home_visit',
            'desired_schedule_at' => now()->addDay(),
            'complaint_notes' => 'Ingin konsultasi herbal.',
            'status' => 'waiting_confirmation',
        ]);
    }

    private function createPaymentMethod(): PaymentMethod
    {
        return PaymentMethod::query()->create([
            'type' => 'bank_transfer',
            'bank_name' => 'BCA',
            'account_number' => '1234567890',
            'account_holder_name' => 'PT Phoenix',
            'qris_image_path' => null,
            'instructions' => 'Transfer ke rekening Phoenix.',
            'is_active' => true,
        ]);
    }

    private function createExaminationFor(CustomerProfile $profile): Examination
    {
        return Examination::query()->create([
            'customer_profile_id' => $profile->id,
            'complaint' => 'Keluhan customer.',
            'result' => 'Hasil pemeriksaan.',
            'summary' => 'Ringkasan pemeriksaan.',
            'internal_recommendation' => 'Rekomendasi internal.',
        ]);
    }

    private function createRecommendationFor(CustomerProfile $profile, Examination $examination): ProductRecommendation
    {
        return ProductRecommendation::query()->create([
            'customer_profile_id' => $profile->id,
            'product_id' => $this->createProduct()->id,
            'examination_id' => $examination->id,
            'notes' => 'Rekomendasi produk herbal.',
        ]);
    }

    private function createProduct(array $overrides = []): Product
    {
        $category = ProductCategory::query()->firstOrCreate(
            ['slug' => 'herbal'],
            ['name' => 'Herbal', 'is_active' => true],
        );

        $count = Product::query()->count();

        return Product::query()->create(array_merge([
            'product_category_id' => $category->id,
            'name' => 'Produk Herbal '.$count,
            'slug' => 'produk-herbal-'.$count,
            'price' => 100000,
            'short_description' => 'Deskripsi singkat produk herbal.',
            'full_description' => 'Deskripsi lengkap produk herbal.',
            'stock_quantity' => 10,
            'low_stock_threshold' => 1,
            'is_active' => true,
            'is_featured' => false,
        ], $overrides));
    }

    private function createService(array $overrides = []): Service
    {
        $count = Service::query()->count();

        return Service::query()->create(array_merge([
            'name' => 'Konsultasi Herbal '.$count,
            'slug' => 'konsultasi-herbal-'.$count,
            'description' => 'Layanan konsultasi herbal.',
            'price' => 150000,
            'visit_type' => 'home_visit',
            'is_active' => true,
            'is_featured' => false,
        ], $overrides));
    }

    private function createVoucher(): Voucher
    {
        return Voucher::query()->create([
            'code' => 'MEMBER10',
            'name' => 'Voucher Member',
            'discount_type' => 'fixed',
            'discount_value' => 10000,
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addDay(),
            'usage_limit' => 10,
            'is_published' => true,
        ]);
    }
}
