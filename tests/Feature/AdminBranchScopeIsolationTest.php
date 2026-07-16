<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Branch;
use App\Models\CustomerProfile;
use App\Models\Event;
use App\Models\Lead;
use App\Models\LeadSource;
use App\Models\OfflineSale;
use App\Models\Order;
use App\Models\PaymentMethod;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminBranchScopeIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_cabang_cannot_access_global_settings(): void
    {
        [$pusat, $bandung] = $this->createBranches();
        $adminCabang = $this->createAdminCabang($bandung);

        $this->actingAs($adminCabang)
            ->get(route('admin.settings.index'))
            ->assertForbidden();
    }

    public function test_admin_pusat_can_access_global_settings(): void
    {
        [$pusat] = $this->createBranches();
        $adminPusat = $this->createAdminPusat($pusat);

        $this->inertiaGet($adminPusat, route('admin.settings.index'))
            ->assertOk()
            ->assertJsonPath('component', 'Admin/Settings/Index');
    }

    public function test_admin_cabang_only_sees_orders_from_own_branch(): void
    {
        [$pusat, $bandung] = $this->createBranches();
        $adminCabang = $this->createAdminCabang($bandung);

        $orderPusat = $this->createOrderForBranch($pusat);
        $orderBandung = $this->createOrderForBranch($bandung);

        $response = $this->inertiaGet($adminCabang, route('admin.orders.index'))
            ->assertOk()
            ->assertJsonPath('component', 'Admin/Orders/Index');

        $orderIds = collect(data_get($response->json(), 'props.orders.data', []))
            ->pluck('id')
            ->all();

        $this->assertContains($orderBandung->id, $orderIds);
        $this->assertNotContains($orderPusat->id, $orderIds);
    }

    public function test_admin_cabang_forbidden_from_other_branch_order_show(): void
    {
        [$pusat, $bandung] = $this->createBranches();
        $adminCabang = $this->createAdminCabang($bandung);
        $orderPusat = $this->createOrderForBranch($pusat);

        $this->actingAs($adminCabang)
            ->get(route('admin.orders.show', $orderPusat))
            ->assertForbidden();
    }

    public function test_admin_pusat_can_see_orders_from_all_branches(): void
    {
        [$pusat, $bandung] = $this->createBranches();
        $adminPusat = $this->createAdminPusat($pusat);

        $orderPusat = $this->createOrderForBranch($pusat);
        $orderBandung = $this->createOrderForBranch($bandung);

        $response = $this->inertiaGet($adminPusat, route('admin.orders.index'))
            ->assertOk();

        $orderIds = collect(data_get($response->json(), 'props.orders.data', []))
            ->pluck('id')
            ->all();

        $this->assertContains($orderPusat->id, $orderIds);
        $this->assertContains($orderBandung->id, $orderIds);
    }

    public function test_admin_cabang_only_sees_staff_from_own_branch(): void
    {
        [$pusat, $bandung] = $this->createBranches();
        $adminCabang = $this->createAdminCabang($bandung);

        $staffPusat = User::factory()->fieldStaff($pusat->id)->create([
            'email' => 'staff.pusat@example.test',
        ]);
        $staffBandung = User::factory()->fieldStaff($bandung->id)->create([
            'email' => 'staff.bandung@example.test',
        ]);

        $response = $this->inertiaGet($adminCabang, route('admin.staff.index'))
            ->assertOk()
            ->assertJsonPath('component', 'Admin/Staff/Index');

        $staffIds = collect(data_get($response->json(), 'props.staff.data', []))
            ->pluck('id')
            ->all();

        $this->assertContains($staffBandung->id, $staffIds);
        $this->assertNotContains($staffPusat->id, $staffIds);
    }

    public function test_admin_cabang_cannot_create_staff_for_other_branch(): void
    {
        [$pusat, $bandung] = $this->createBranches();
        $adminCabang = $this->createAdminCabang($bandung);

        $this->actingAs($adminCabang)->post(route('admin.staff.store'), [
            'name' => 'Staff Lain Cabang',
            'email' => 'staff.lain@example.test',
            'phone_number' => '08123456789',
            'branch_id' => $pusat->id,
            'password' => 'password123',
        ])->assertForbidden();

        $this->assertDatabaseMissing('users', [
            'email' => 'staff.lain@example.test',
            'role' => 'field_staff',
        ]);
    }

    public function test_admin_cabang_only_sees_customers_with_activity_in_own_branch(): void
    {
        [$pusat, $bandung] = $this->createBranches();
        $adminCabang = $this->createAdminCabang($bandung);

        $customerPusat = $this->createCustomerProfile('Customer Pusat');
        $customerBandung = $this->createCustomerProfile('Customer Bandung');
        $this->createOrderForBranch($pusat, $customerPusat);
        $this->createOrderForBranch($bandung, $customerBandung);

        $response = $this->inertiaGet($adminCabang, route('admin.customers.index'))
            ->assertOk()
            ->assertJsonPath('component', 'Admin/Customers/Index');

        $customerIds = collect(data_get($response->json(), 'props.customerProfiles.data', []))
            ->pluck('id')
            ->all();

        $this->assertContains($customerBandung->id, $customerIds);
        $this->assertNotContains($customerPusat->id, $customerIds);
    }

    public function test_admin_cabang_forbidden_from_other_branch_customer_show(): void
    {
        [$pusat, $bandung] = $this->createBranches();
        $adminCabang = $this->createAdminCabang($bandung);

        $customerPusat = $this->createCustomerProfile('Customer Pusat');
        $this->createOrderForBranch($pusat, $customerPusat);

        $this->actingAs($adminCabang)
            ->get(route('admin.customers.show', $customerPusat))
            ->assertForbidden();
    }

    public function test_admin_cabang_only_sees_bookings_from_own_branch(): void
    {
        [$pusat, $bandung] = $this->createBranches();
        $adminCabang = $this->createAdminCabang($bandung);

        $bookingPusat = $this->createBookingForBranch($pusat);
        $bookingBandung = $this->createBookingForBranch($bandung);

        $response = $this->inertiaGet($adminCabang, route('admin.bookings.index'))
            ->assertOk()
            ->assertJsonPath('component', 'Admin/Bookings/Index');

        $bookingIds = collect(data_get($response->json(), 'props.bookings.data', []))
            ->pluck('id')
            ->all();

        $this->assertContains($bookingBandung->id, $bookingIds);
        $this->assertNotContains($bookingPusat->id, $bookingIds);
    }

    public function test_admin_cabang_forbidden_from_other_branch_booking_show(): void
    {
        [$pusat, $bandung] = $this->createBranches();
        $adminCabang = $this->createAdminCabang($bandung);
        $bookingPusat = $this->createBookingForBranch($pusat);

        $this->actingAs($adminCabang)
            ->get(route('admin.bookings.show', $bookingPusat))
            ->assertForbidden();
    }

    public function test_admin_cabang_only_sees_leads_from_own_branch(): void
    {
        [$pusat, $bandung] = $this->createBranches();
        $adminCabang = $this->createAdminCabang($bandung);

        $leadPusat = $this->createLeadForBranch($pusat);
        $leadBandung = $this->createLeadForBranch($bandung);

        $response = $this->inertiaGet($adminCabang, route('admin.leads.index'))
            ->assertOk()
            ->assertJsonPath('component', 'Admin/Leads/Index');

        $leadIds = collect(data_get($response->json(), 'props.leads.data', []))
            ->pluck('id')
            ->all();

        $this->assertContains($leadBandung->id, $leadIds);
        $this->assertNotContains($leadPusat->id, $leadIds);
    }

    public function test_admin_cabang_forbidden_from_other_branch_lead_show(): void
    {
        [$pusat, $bandung] = $this->createBranches();
        $adminCabang = $this->createAdminCabang($bandung);
        $leadPusat = $this->createLeadForBranch($pusat);

        $this->actingAs($adminCabang)
            ->get(route('admin.leads.show', $leadPusat))
            ->assertForbidden();
    }

    public function test_admin_pusat_can_see_leads_from_all_branches(): void
    {
        [$pusat, $bandung] = $this->createBranches();
        $adminPusat = $this->createAdminPusat($pusat);

        $leadPusat = $this->createLeadForBranch($pusat);
        $leadBandung = $this->createLeadForBranch($bandung);

        $response = $this->inertiaGet($adminPusat, route('admin.leads.index'))
            ->assertOk();

        $leadIds = collect(data_get($response->json(), 'props.leads.data', []))
            ->pluck('id')
            ->all();

        $this->assertContains($leadPusat->id, $leadIds);
        $this->assertContains($leadBandung->id, $leadIds);
    }

    public function test_admin_cabang_only_sees_events_from_own_branch(): void
    {
        [$pusat, $bandung] = $this->createBranches();
        $adminCabang = $this->createAdminCabang($bandung);

        $eventPusat = $this->createEventForBranch($pusat);
        $eventBandung = $this->createEventForBranch($bandung);

        $response = $this->inertiaGet($adminCabang, route('admin.events.index'))
            ->assertOk()
            ->assertJsonPath('component', 'Admin/Events/Index');

        $eventIds = collect(data_get($response->json(), 'props.events.data', []))
            ->pluck('id')
            ->all();

        $this->assertContains($eventBandung->id, $eventIds);
        $this->assertNotContains($eventPusat->id, $eventIds);
    }

    public function test_admin_cabang_forbidden_from_other_branch_event_show(): void
    {
        [$pusat, $bandung] = $this->createBranches();
        $adminCabang = $this->createAdminCabang($bandung);
        $eventPusat = $this->createEventForBranch($pusat);

        $this->actingAs($adminCabang)
            ->get(route('admin.events.show', $eventPusat))
            ->assertForbidden();
    }

    public function test_admin_cabang_only_sees_offline_sales_from_own_branch(): void
    {
        [$pusat, $bandung] = $this->createBranches();
        $adminCabang = $this->createAdminCabang($bandung);

        $salePusat = $this->createOfflineSaleForBranch($pusat);
        $saleBandung = $this->createOfflineSaleForBranch($bandung);

        $response = $this->inertiaGet($adminCabang, route('admin.offline-sales.index'))
            ->assertOk()
            ->assertJsonPath('component', 'Admin/OfflineSales/Index');

        $saleIds = collect(data_get($response->json(), 'props.offlineSales.data', []))
            ->pluck('id')
            ->all();

        $this->assertContains($saleBandung->id, $saleIds);
        $this->assertNotContains($salePusat->id, $saleIds);
    }

    public function test_admin_cabang_forbidden_from_other_branch_offline_sale_show(): void
    {
        [$pusat, $bandung] = $this->createBranches();
        $adminCabang = $this->createAdminCabang($bandung);
        $salePusat = $this->createOfflineSaleForBranch($pusat);

        $this->actingAs($adminCabang)
            ->get(route('admin.offline-sales.show', $salePusat))
            ->assertForbidden();
    }

    /**
     * @return array{0: Branch, 1: Branch}
     */
    private function createBranches(): array
    {
        $pusat = Branch::query()->create([
            'name' => 'Pusat',
            'slug' => 'pusat',
            'code' => 'PST',
            'is_active' => true,
        ]);

        $bandung = Branch::query()->create([
            'name' => 'Cabang Bandung',
            'slug' => 'cabang-bandung',
            'code' => 'BDG',
            'is_active' => true,
        ]);

        return [$pusat, $bandung];
    }

    private function createAdminPusat(Branch $branch): User
    {
        return User::factory()->adminCentral($branch->id)->create([
            'email' => 'admin.pusat.scope@example.test',
        ]);
    }

    private function createAdminCabang(Branch $branch): User
    {
        return User::factory()->adminBranch($branch->id)->create([
            'email' => 'admin.cabang.scope@example.test',
        ]);
    }

    private function createCustomerProfile(string $name = 'Customer Scope'): CustomerProfile
    {
        $user = User::factory()->customer()->create();

        return CustomerProfile::query()->create([
            'user_id' => $user->id,
            'name' => $name,
            'whatsapp_number' => '08'.random_int(100000000, 999999999),
            'primary_address' => 'Alamat '.$name,
            'member_status' => 'non_member',
            'internal_notes' => null,
        ]);
    }

    private function createOrderForBranch(Branch $branch, ?CustomerProfile $profile = null): Order
    {
        $profile ??= $this->createCustomerProfile('Customer '.$branch->code);

        return Order::query()->create([
            'order_number' => 'ORD-'.$branch->code.'-'.Order::query()->count(),
            'branch_id' => $branch->id,
            'user_id' => $profile->user_id,
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
    }

    private function createBookingForBranch(Branch $branch): Booking
    {
        $profile = $this->createCustomerProfile('Booking '.$branch->code);
        $service = Service::query()->create([
            'name' => 'Layanan '.$branch->code,
            'slug' => 'layanan-'.$branch->code.'-'.Service::query()->count(),
            'description' => 'Deskripsi layanan',
            'price' => 150000,
            'visit_type' => 'both',
            'image_path' => null,
            'is_active' => true,
            'is_featured' => false,
        ]);

        return Booking::query()->create([
            'booking_number' => 'BK-'.$branch->code.'-'.Booking::query()->count(),
            'branch_id' => $branch->id,
            'user_id' => $profile->user_id,
            'customer_profile_id' => $profile->id,
            'service_id' => $service->id,
            'name' => $profile->name,
            'whatsapp_number' => $profile->whatsapp_number,
            'visit_type' => 'home_visit',
            'desired_schedule_at' => now()->addDay(),
            'complaint_notes' => 'Keluhan dummy',
            'status' => 'waiting_confirmation',
        ]);
    }

    private function createLeadSource(): LeadSource
    {
        return LeadSource::query()->firstOrCreate(
            ['slug' => 'sumber-scope-test'],
            [
                'name' => 'Sumber Scope Test',
                'is_active' => true,
            ]
        );
    }

    private function createEventForBranch(Branch $branch): Event
    {
        return Event::query()->create([
            'branch_id' => $branch->id,
            'name' => 'Event '.$branch->code,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDay()->toDateString(),
            'location' => 'Lokasi '.$branch->code,
            'organizer' => 'Organizer '.$branch->code,
            'notes' => null,
            'is_active' => true,
        ]);
    }

    private function createLeadForBranch(Branch $branch): Lead
    {
        $source = $this->createLeadSource();

        return Lead::query()->create([
            'branch_id' => $branch->id,
            'lead_source_id' => $source->id,
            'name' => 'Lead '.$branch->code,
            'whatsapp_number' => '08'.random_int(100000000, 999999999),
            'address' => 'Alamat Lead '.$branch->code,
            'follow_up_status' => 'new',
            'internal_notes' => null,
        ]);
    }

    private function createOfflineSaleForBranch(Branch $branch): OfflineSale
    {
        $paymentMethod = PaymentMethod::query()->create([
            'type' => 'bank_transfer',
            'bank_name' => 'BCA '.$branch->code,
            'account_number' => (string) random_int(1000000000, 9999999999),
            'account_holder_name' => 'PT Phoenix',
            'qris_image_path' => null,
            'instructions' => 'Transfer',
            'is_active' => true,
        ]);

        return OfflineSale::query()->create([
            'sale_number' => 'OS-'.$branch->code.'-'.OfflineSale::query()->count(),
            'branch_id' => $branch->id,
            'payment_method_id' => $paymentMethod->id,
            'source' => 'offline',
            'customer_name' => 'Customer Offline '.$branch->code,
            'customer_whatsapp_number' => '08'.random_int(100000000, 999999999),
            'subtotal' => 150000,
            'voucher_discount_amount' => 0,
            'total' => 150000,
            'notes' => null,
            'sold_at' => now(),
        ]);
    }

    private function inertiaGet(User $user, string $url)
    {
        $headers = ['X-Inertia' => 'true'];

        if (file_exists(public_path('build/manifest.json'))) {
            $headers['X-Inertia-Version'] = hash_file('xxh128', public_path('build/manifest.json'));
        }

        return $this->actingAs($user)->withHeaders($headers)->get($url);
    }
}
