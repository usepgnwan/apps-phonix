<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\CustomerProfile;
use App\Models\Examination;
use App\Models\OfflineSale;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductRecommendation;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminExaminationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_admin_examinations_index(): void
    {
        $this->get(route('admin.examinations.index'))->assertRedirect(route('login'));
    }

    public function test_non_admin_gets_forbidden(): void
    {
        $user = User::factory()->create(['role' => 'customer', 'is_active' => true]);

        $this->actingAs($user)->get(route('admin.examinations.index'))->assertForbidden();
    }

    public function test_inactive_admin_gets_forbidden(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => false]);

        $this->actingAs($admin)->get(route('admin.examinations.index'))->assertForbidden();
    }

    public function test_active_admin_can_view_index_create_and_show_pages(): void
    {
        $admin = $this->createAdmin();
        $customerProfile = $this->createCustomerProfile();
        $booking = $this->createBooking($customerProfile);
        $product = $this->createProduct(['name' => 'Herbal Rekomendasi']);
        $inactiveProduct = $this->createProduct(['name' => 'Herbal Nonaktif', 'is_active' => false]);
        $examination = $this->createExamination($customerProfile, $booking, $admin, $product);

        $this->inertiaGet($admin, route('admin.examinations.index'))
            ->assertOk()
            ->assertJsonPath('component', 'Admin/Examinations/Index')
            ->assertJsonPath('props.examinations.0.id', $examination->id)
            ->assertJsonPath('props.examinations.0.customer_profile.name', $customerProfile->name)
            ->assertJsonPath('props.examinations.0.creator.id', $admin->id)
            ->assertJsonPath('props.examinations.0.product_recommendations.0.product.name', $product->name);

        $this->inertiaGet($admin, route('admin.examinations.create'))
            ->assertOk()
            ->assertJsonPath('component', 'Admin/Examinations/Create')
            ->assertJsonPath('props.customerProfiles.0.name', $customerProfile->name)
            ->assertJsonPath('props.bookings.0.id', $booking->id)
            ->assertJsonPath('props.products.0.name', 'Herbal Rekomendasi')
            ->assertJsonMissingPath('props.products.1');

        $this->assertSame('Herbal Nonaktif', $inactiveProduct->name);

        $this->inertiaGet($admin, route('admin.examinations.show', $examination))
            ->assertOk()
            ->assertJsonPath('component', 'Admin/Examinations/Show')
            ->assertJsonPath('props.examination.id', $examination->id)
            ->assertJsonPath('props.examination.booking.id', $booking->id)
            ->assertJsonPath('props.examination.product_recommendations.0.product.name', $product->name);
    }

    public function test_active_admin_can_create_examination_without_product_recommendations(): void
    {
        $admin = $this->createAdmin();
        $customerProfile = $this->createCustomerProfile();
        $booking = $this->createBooking($customerProfile);

        $response = $this->actingAs($admin)->post(route('admin.examinations.store'), $this->examinationPayload($customerProfile, $booking));

        $examination = Examination::query()->latest('id')->firstOrFail();
        $response->assertRedirect(route('admin.examinations.show', $examination));

        $this->assertDatabaseHas('examinations', [
            'id' => $examination->id,
            'customer_profile_id' => $customerProfile->id,
            'booking_id' => $booking->id,
            'complaint' => 'Keluhan customer',
            'result' => 'Hasil pemeriksaan',
            'summary' => 'Ringkasan pemeriksaan',
            'internal_recommendation' => 'Rekomendasi internal',
            'created_by' => $admin->id,
        ]);
        $this->assertSame(0, ProductRecommendation::query()->count());
        $this->assertSame('waiting_confirmation', $booking->fresh()->status);
        $this->assertSame(0, Order::query()->count());
        $this->assertSame(0, OfflineSale::query()->count());
    }

    public function test_active_admin_can_create_examination_with_product_recommendations(): void
    {
        $admin = $this->createAdmin();
        $customerProfile = $this->createCustomerProfile();
        $booking = $this->createBooking($customerProfile);
        $productA = $this->createProduct(['name' => 'Herbal A']);
        $productB = $this->createProduct(['name' => 'Herbal B']);

        $response = $this->actingAs($admin)->post(route('admin.examinations.store'), array_merge($this->examinationPayload($customerProfile, $booking), [
            'product_recommendations' => [
                ['product_id' => $productA->id, 'notes' => 'Diminum pagi'],
                ['product_id' => $productB->id, 'notes' => null],
            ],
        ]));

        $examination = Examination::query()->latest('id')->firstOrFail();
        $response->assertRedirect(route('admin.examinations.show', $examination));

        $this->assertDatabaseHas('product_recommendations', [
            'customer_profile_id' => $customerProfile->id,
            'product_id' => $productA->id,
            'examination_id' => $examination->id,
            'notes' => 'Diminum pagi',
            'created_by' => $admin->id,
        ]);
        $this->assertDatabaseHas('product_recommendations', [
            'customer_profile_id' => $customerProfile->id,
            'product_id' => $productB->id,
            'examination_id' => $examination->id,
            'notes' => null,
            'created_by' => $admin->id,
        ]);
    }

    public function test_created_by_payload_cannot_be_spoofed(): void
    {
        $admin = $this->createAdmin();
        $otherAdmin = $this->createAdmin();
        $customerProfile = $this->createCustomerProfile();
        $product = $this->createProduct();

        $this->actingAs($admin)->post(route('admin.examinations.store'), array_merge($this->examinationPayload($customerProfile), [
            'created_by' => $otherAdmin->id,
            'product_recommendations' => [
                ['product_id' => $product->id, 'notes' => 'Catatan', 'created_by' => $otherAdmin->id],
            ],
        ]))->assertSessionHasErrors(['created_by', 'product_recommendations.0.created_by']);
    }

    public function test_invalid_examination_fields_are_rejected(): void
    {
        $admin = $this->createAdmin();

        $this->actingAs($admin)->post(route('admin.examinations.store'), [
            'customer_profile_id' => 999999,
            'booking_id' => 999999,
            'complaint' => null,
            'result' => null,
            'summary' => null,
            'internal_recommendation' => null,
        ])->assertSessionHasErrors(['customer_profile_id', 'booking_id', 'complaint', 'result', 'summary', 'internal_recommendation']);
    }

    public function test_booking_must_belong_to_customer_profile(): void
    {
        $admin = $this->createAdmin();
        $customerProfile = $this->createCustomerProfile();
        $otherProfile = $this->createCustomerProfile();
        $otherBooking = $this->createBooking($otherProfile);

        $this->actingAs($admin)->post(route('admin.examinations.store'), $this->examinationPayload($customerProfile, $otherBooking))
            ->assertSessionHasErrors('booking_id');
    }

    public function test_recommendations_require_active_products(): void
    {
        $admin = $this->createAdmin();
        $customerProfile = $this->createCustomerProfile();
        $inactiveProduct = $this->createProduct(['is_active' => false]);

        $this->actingAs($admin)->post(route('admin.examinations.store'), array_merge($this->examinationPayload($customerProfile), [
            'product_recommendations' => [
                ['product_id' => $inactiveProduct->id, 'notes' => 'Tidak boleh'],
            ],
        ]))->assertSessionHasErrors('product_recommendations.0.product_id');
    }

    public function test_non_admin_cannot_create_examination(): void
    {
        $user = User::factory()->create(['role' => 'customer', 'is_active' => true]);
        $customerProfile = $this->createCustomerProfile();

        $this->actingAs($user)->post(route('admin.examinations.store'), $this->examinationPayload($customerProfile))->assertForbidden();
    }

    private function createAdmin(): User
    {
        return User::factory()->create(['role' => 'admin', 'is_active' => true]);
    }

    private function inertiaGet(User $admin, string $url): \Illuminate\Testing\TestResponse
    {
        $request = $this->actingAs($admin)->withHeader('X-Inertia', 'true');

        if (file_exists(public_path('build/manifest.json'))) {
            $request->withHeader('X-Inertia-Version', hash_file('xxh128', public_path('build/manifest.json')));
        }

        return $request->get($url);
    }

    private function createCustomerProfile(): CustomerProfile
    {
        $index = CustomerProfile::query()->count() + 1;
        $user = User::factory()->create(['role' => 'customer', 'is_active' => true]);

        return CustomerProfile::query()->create([
            'user_id' => $user->id,
            'name' => 'Customer '.$index,
            'whatsapp_number' => '0812345678'.$index,
            'primary_address' => 'Alamat '.$index,
            'member_status' => 'member',
        ]);
    }

    private function createBooking(CustomerProfile $customerProfile): Booking
    {
        $service = Service::query()->create([
            'name' => 'Layanan '.Service::query()->count(),
            'slug' => 'layanan-'.Service::query()->count(),
            'description' => 'Deskripsi layanan',
            'price' => 150000,
            'visit_type' => 'both',
            'image_path' => null,
            'is_active' => true,
            'is_featured' => false,
        ]);

        return Booking::query()->create([
            'booking_number' => 'BK-TEST-'.Booking::query()->count(),
            'user_id' => $customerProfile->user_id,
            'customer_profile_id' => $customerProfile->id,
            'service_id' => $service->id,
            'name' => $customerProfile->name,
            'whatsapp_number' => $customerProfile->whatsapp_number,
            'visit_type' => 'home_visit',
            'desired_schedule_at' => now()->addDay(),
            'complaint_notes' => 'Ingin konsultasi.',
            'status' => 'waiting_confirmation',
        ]);
    }

    private function createProduct(array $attributes = []): Product
    {
        $index = Product::query()->count() + 1;
        $category = ProductCategory::query()->first() ?? ProductCategory::query()->create([
            'name' => 'Kategori Herbal',
            'slug' => 'kategori-herbal',
            'description' => 'Deskripsi kategori',
            'is_active' => true,
        ]);

        return Product::query()->create(array_merge([
            'product_category_id' => $category->id,
            'name' => 'Produk '.$index,
            'slug' => 'produk-'.$index,
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
        ], $attributes));
    }

    private function createExamination(CustomerProfile $customerProfile, Booking $booking, User $admin, Product $product): Examination
    {
        $examination = Examination::query()->create([
            'customer_profile_id' => $customerProfile->id,
            'booking_id' => $booking->id,
            'complaint' => 'Keluhan customer',
            'result' => 'Hasil pemeriksaan',
            'summary' => 'Ringkasan pemeriksaan',
            'internal_recommendation' => 'Rekomendasi internal',
            'created_by' => $admin->id,
        ]);

        $examination->productRecommendations()->create([
            'customer_profile_id' => $customerProfile->id,
            'product_id' => $product->id,
            'notes' => 'Diminum pagi',
            'created_by' => $admin->id,
        ]);

        return $examination;
    }

    private function examinationPayload(CustomerProfile $customerProfile, ?Booking $booking = null): array
    {
        return [
            'customer_profile_id' => $customerProfile->id,
            'booking_id' => $booking?->id,
            'complaint' => 'Keluhan customer',
            'result' => 'Hasil pemeriksaan',
            'summary' => 'Ringkasan pemeriksaan',
            'internal_recommendation' => 'Rekomendasi internal',
            'product_recommendations' => [],
        ];
    }
}
