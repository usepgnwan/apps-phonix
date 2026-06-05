<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\CustomerProfile;
use App\Models\Event;
use App\Models\Examination;
use App\Models\FieldActivity;
use App\Models\Lead;
use App\Models\LeadSource;
use App\Models\OfflineSale;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductRecommendation;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_admin_dashboard(): void
    {
        $this->get(route('admin.dashboard.index'))->assertRedirect(route('login'));
    }

    public function test_non_admin_gets_forbidden(): void
    {
        $user = User::factory()->create(['role' => 'customer', 'is_active' => true]);

        $this->actingAs($user)->get(route('admin.dashboard.index'))->assertForbidden();
        $this->actingAs($user)->get(route('admin.reports.index'))->assertForbidden();
    }

    public function test_inactive_admin_gets_forbidden(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => false]);

        $this->actingAs($admin)->get(route('admin.dashboard.index'))->assertForbidden();
        $this->actingAs($admin)->get(route('admin.reports.index'))->assertForbidden();
    }

    public function test_active_admin_can_view_dashboard_with_summary_and_recent_data(): void
    {
        $admin = $this->createAdmin();
        $data = $this->seedReportData();

        $response = $this->actingAs($admin)->withHeader('X-Inertia', 'true')->get(route('admin.dashboard.index'));

        $response
            ->assertOk()
            ->assertJsonPath('component', 'Admin/Dashboard/Index')
            ->assertJsonPath('props.page', 'admin.dashboard.index')
            ->assertJsonPath('props.summary.products', 2)
            ->assertJsonPath('props.summary.services', 1)
            ->assertJsonPath('props.summary.orders', 3)
            ->assertJsonPath('props.summary.bookings', 2)
            ->assertJsonPath('props.summary.leads', 3)
            ->assertJsonPath('props.summary.customerProfiles', 2)
            ->assertJsonPath('props.summary.fieldActivities', 2)
            ->assertJsonPath('props.summary.offlineSales', 2)
            ->assertJsonPath('props.summary.examinations', 1)
            ->assertJsonPath('props.lowStockProducts.0.id', $data['lowStockProduct']->id);

        $response->assertJsonFragment(['order_number' => 'ORD-003']);
        $response->assertJsonFragment(['booking_number' => 'BK-002']);
        $response->assertJsonFragment(['name' => 'Lead Ketiga']);
        $response->assertJsonFragment(['sale_number' => 'OFF-002']);
    }

    public function test_active_admin_can_view_reports_page_with_grouped_metrics(): void
    {
        $admin = $this->createAdmin();
        $data = $this->seedReportData();

        $response = $this->actingAs($admin)->withHeader('X-Inertia', 'true')->get(route('admin.reports.index'));

        $response
            ->assertOk()
            ->assertJsonPath('component', 'Admin/Reports/Index')
            ->assertJsonPath('props.page', 'admin.reports.index')
            ->assertJsonPath('props.reports.leadsBySource.0.name', $data['leadSource']->name)
            ->assertJsonPath('props.reports.leadsBySource.0.total', 2)
            ->assertJsonPath('props.reports.leadsByAssignedStaff.0.name', $data['fieldStaff']->name)
            ->assertJsonPath('props.reports.leadsByAssignedStaff.0.total', 2)
            ->assertJsonPath('props.reports.bookingsByService.0.name', $data['service']->name)
            ->assertJsonPath('props.reports.bookingsByService.0.total', 2)
            ->assertJsonPath('props.reports.websiteOrderRevenue', '350000.00')
            ->assertJsonPath('props.reports.offlineSalesRevenue', '200000.00')
            ->assertJsonPath('props.reports.productRecommendationsByProduct.0.name', $data['lowStockProduct']->name)
            ->assertJsonPath('props.reports.productRecommendationsByProduct.0.total', 1);

        $response->assertJsonFragment(['status' => 'confirmed', 'total' => 1]);
        $response->assertJsonFragment(['status' => 'payment_received', 'total' => 1]);
        $response->assertJsonFragment(['activityType' => 'visit', 'total' => 1]);
    }

    private function createAdmin(): User
    {
        return User::factory()->create(['role' => 'admin', 'is_active' => true]);
    }

    private function seedReportData(): array
    {
        $customerA = $this->createCustomerProfile('Customer A');
        $customerB = $this->createCustomerProfile('Customer B');
        $fieldStaff = User::factory()->create(['role' => 'field_staff', 'is_active' => true, 'name' => 'Staff Lapangan']);
        $service = $this->createService();
        $lowStockProduct = $this->createProduct(['name' => 'Herbal Low Stock', 'slug' => 'herbal-low-stock', 'stock_quantity' => 2, 'low_stock_threshold' => 3]);
        $this->createProduct(['name' => 'Herbal Aman', 'slug' => 'herbal-aman', 'stock_quantity' => 10, 'low_stock_threshold' => 3]);
        $leadSource = LeadSource::query()->create(['name' => 'Website', 'slug' => 'website', 'is_active' => true]);
        $event = Event::query()->create([
            'name' => 'Event A',
            'event_date' => now()->addDay()->toDateString(),
            'location' => 'Lokasi Event',
            'organizer' => 'Organizer',
            'notes' => 'Catatan event',
        ]);

        $bookingA = $this->createBooking($customerA, $service, 'BK-001', 'confirmed');
        $this->createBooking($customerB, $service, 'BK-002', 'waiting_confirmation', now()->addMinute());

        $leadA = $this->createLead($leadSource, $fieldStaff, $customerA, $event, 'Lead Pertama');
        $this->createLead($leadSource, $fieldStaff, $customerB, $event, 'Lead Kedua', now()->addMinute());
        $this->createLead(null, null, null, null, 'Lead Ketiga', now()->addMinutes(2));

        $this->createOrder($customerA, 'ORD-001', 100000, 'paid', 'completed');
        $this->createOrder($customerA, 'ORD-002', 250000, 'pending', 'payment_received', now()->addMinute());
        $this->createOrder($customerB, 'ORD-003', 500000, 'pending', 'waiting_payment', now()->addMinutes(2));

        $this->createOfflineSale($customerA, $leadA, $fieldStaff, $event, 'OFF-001', 125000);
        $this->createOfflineSale($customerB, null, null, null, 'OFF-002', 75000, now()->addMinute());

        FieldActivity::query()->create([
            'field_staff_id' => $fieldStaff->id,
            'lead_id' => $leadA->id,
            'activity_type' => 'visit',
            'activity_at' => now(),
            'notes' => 'Kunjungan',
            'follow_up_status' => 'interested',
        ]);
        FieldActivity::query()->create([
            'field_staff_id' => $fieldStaff->id,
            'lead_id' => $leadA->id,
            'activity_type' => 'follow_up',
            'activity_at' => now(),
            'notes' => 'Follow up',
            'follow_up_status' => 'needs_follow_up',
        ]);

        $examination = Examination::query()->create([
            'customer_profile_id' => $customerA->id,
            'booking_id' => $bookingA->id,
            'complaint' => 'Keluhan',
            'result' => 'Hasil',
            'summary' => 'Ringkasan',
            'internal_recommendation' => 'Rekomendasi',
            'created_by' => $fieldStaff->id,
        ]);
        ProductRecommendation::query()->create([
            'customer_profile_id' => $customerA->id,
            'product_id' => $lowStockProduct->id,
            'examination_id' => $examination->id,
            'notes' => 'Rekomendasi produk',
            'created_by' => $fieldStaff->id,
        ]);

        return compact('leadSource', 'fieldStaff', 'service', 'lowStockProduct');
    }

    private function createCustomerProfile(string $name): CustomerProfile
    {
        $user = User::factory()->create(['role' => 'customer', 'is_active' => true]);

        return CustomerProfile::query()->create([
            'user_id' => $user->id,
            'name' => $name,
            'whatsapp_number' => '08123456789',
            'primary_address' => 'Alamat '.$name,
            'member_status' => 'member',
        ]);
    }

    private function createService(): Service
    {
        return Service::query()->create([
            'name' => 'Konsultasi Herbal',
            'slug' => 'konsultasi-herbal',
            'description' => 'Deskripsi layanan',
            'price' => 150000,
            'visit_type' => 'both',
            'image_path' => null,
            'is_active' => true,
            'is_featured' => false,
        ]);
    }

    private function createProduct(array $attributes): Product
    {
        $category = ProductCategory::query()->first() ?? ProductCategory::query()->create([
            'name' => 'Kategori Herbal',
            'slug' => 'kategori-herbal',
            'description' => 'Deskripsi kategori',
            'is_active' => true,
        ]);

        return Product::query()->create(array_merge([
            'product_category_id' => $category->id,
            'price' => 100000,
            'short_description' => 'Singkat',
            'full_description' => 'Lengkap',
            'benefits' => 'Manfaat',
            'usage_rules' => 'Aturan',
            'notes' => 'Catatan',
            'image_path' => null,
            'is_active' => true,
            'is_featured' => false,
        ], $attributes));
    }

    private function createBooking(CustomerProfile $customerProfile, Service $service, string $bookingNumber, string $status, mixed $createdAt = null): Booking
    {
        $createdAt ??= now();

        return Booking::query()->create([
            'booking_number' => $bookingNumber,
            'user_id' => $customerProfile->user_id,
            'customer_profile_id' => $customerProfile->id,
            'service_id' => $service->id,
            'name' => $customerProfile->name,
            'whatsapp_number' => $customerProfile->whatsapp_number,
            'visit_type' => 'home_visit',
            'desired_schedule_at' => now()->addDay(),
            'complaint_notes' => 'Keluhan booking',
            'status' => $status,
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ]);
    }

    private function createLead(?LeadSource $leadSource, ?User $fieldStaff, ?CustomerProfile $customerProfile, ?Event $event, string $name, mixed $createdAt = null): Lead
    {
        $createdAt ??= now();

        return Lead::query()->create([
            'assigned_staff_id' => $fieldStaff?->id,
            'customer_profile_id' => $customerProfile?->id,
            'lead_source_id' => $leadSource?->id ?? LeadSource::query()->create(['name' => 'Fallback', 'slug' => 'fallback', 'is_active' => true])->id,
            'event_id' => $event?->id,
            'name' => $name,
            'whatsapp_number' => '08123456789',
            'follow_up_status' => 'new',
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ]);
    }

    private function createOrder(CustomerProfile $customerProfile, string $orderNumber, int $total, string $paymentStatus, string $status, mixed $createdAt = null): Order
    {
        $createdAt ??= now();

        return Order::query()->create([
            'order_number' => $orderNumber,
            'user_id' => $customerProfile->user_id,
            'customer_profile_id' => $customerProfile->id,
            'customer_name' => $customerProfile->name,
            'customer_whatsapp_number' => $customerProfile->whatsapp_number,
            'shipping_address' => $customerProfile->primary_address,
            'subtotal' => $total,
            'voucher_discount_amount' => 0,
            'shipping_cost' => 0,
            'total' => $total,
            'shipping_status' => 'pending_shipping_confirmation',
            'payment_status' => $paymentStatus,
            'status' => $status,
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ]);
    }

    private function createOfflineSale(?CustomerProfile $customerProfile, ?Lead $lead, ?User $fieldStaff, ?Event $event, string $saleNumber, int $total, mixed $createdAt = null): OfflineSale
    {
        $createdAt ??= now();

        return OfflineSale::query()->create([
            'sale_number' => $saleNumber,
            'customer_profile_id' => $customerProfile?->id,
            'lead_id' => $lead?->id,
            'field_staff_id' => $fieldStaff?->id,
            'event_id' => $event?->id,
            'source' => 'event',
            'customer_name' => $customerProfile?->name ?? 'Customer Offline',
            'customer_whatsapp_number' => $customerProfile?->whatsapp_number,
            'total' => $total,
            'notes' => 'Penjualan offline',
            'sold_at' => now(),
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ]);
    }
}
