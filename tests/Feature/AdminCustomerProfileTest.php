<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Branch;
use App\Models\CustomerProfile;
use App\Models\Order;
use App\Models\Service;
use App\Models\User;
use App\Models\Voucher;
use App\Models\VoucherRedemption;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCustomerProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_admin_customers_index(): void
    {
        $this->get(route('admin.customers.index'))->assertRedirect(route('login'));
    }

    public function test_authenticated_non_admin_gets_forbidden(): void
    {
        $user = User::factory()->create(['role' => 'customer', 'is_active' => true]);

        $this->actingAs($user)->get(route('admin.customers.index'))->assertForbidden();
    }

    public function test_inactive_admin_gets_forbidden(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => false]);

        $this->actingAs($admin)->get(route('admin.customers.index'))->assertForbidden();
    }

    public function test_active_admin_can_view_customers_index_with_counts(): void
    {
        $admin = $this->createAdmin();
        $profile = $this->createCustomerProfile();
        $this->createRelatedData($profile);

        $this->inertiaGet($admin, route('admin.customers.index'))
            ->assertOk()
            ->assertJsonPath('component', 'Admin/Customers/Index')
            ->assertJsonPath('props.page', 'admin.customers.index')
            ->assertJsonPath('props.customerProfiles.data.0.orders_count', 1)
            ->assertJsonPath('props.customerProfiles.data.0.bookings_count', 1)
            ->assertJsonPath('props.customerProfiles.data.0.voucher_redemptions_count', 1);
    }

    public function test_active_admin_can_view_customer_show_with_relations(): void
    {
        $admin = $this->createAdmin();
        $profile = $this->createCustomerProfile();
        $this->createRelatedData($profile);

        $this->inertiaGet($admin, route('admin.customers.show', $profile))
            ->assertOk()
            ->assertJsonPath('component', 'Admin/Customers/Show')
            ->assertJsonPath('props.page', 'admin.customers.show')
            ->assertJsonStructure([
                'props' => [
                    'customerProfile' => [
                        'user',
                        'orders',
                        'bookings',
                        'voucher_redemptions',
                    ],
                ],
            ])
            ->assertJsonPath('props.customerProfile.orders_count', 1)
            ->assertJsonPath('props.customerProfile.bookings_count', 1)
            ->assertJsonPath('props.customerProfile.voucher_redemptions_count', 1);
    }

    public function test_active_admin_can_update_customer_profile(): void
    {
        $admin = $this->createAdmin();
        $profile = $this->createCustomerProfile();

        $response = $this->actingAs($admin)->patch(route('admin.customers.update', $profile), [
            'name' => 'Nama Baru',
            'whatsapp_number' => '08999999999',
            'primary_address' => 'Alamat Baru',
            'member_status' => 'member',
            'internal_notes' => 'Catatan admin',
        ]);

        $response->assertRedirect(route('admin.customers.show', $profile))->assertSessionHas('success');

        $this->assertDatabaseHas('customer_profiles', [
            'id' => $profile->id,
            'name' => 'Nama Baru',
            'whatsapp_number' => '08999999999',
            'primary_address' => 'Alamat Baru',
            'member_status' => 'member',
            'internal_notes' => 'Catatan admin',
        ]);
    }

    public function test_invalid_member_status_is_rejected(): void
    {
        $admin = $this->createAdmin();
        $profile = $this->createCustomerProfile();

        $this->actingAs($admin)->patch(route('admin.customers.update', $profile), [
            'name' => 'Nama Baru',
            'whatsapp_number' => '08999999999',
            'primary_address' => 'Alamat Baru',
            'member_status' => 'vip',
            'internal_notes' => 'Catatan admin',
        ])->assertSessionHasErrors('member_status');
    }

    public function test_non_admin_cannot_update_customer_profile(): void
    {
        $user = User::factory()->create(['role' => 'customer', 'is_active' => true]);
        $profile = $this->createCustomerProfile();

        $this->actingAs($user)->patch(route('admin.customers.update', $profile), [
            'name' => 'Nama Baru',
            'whatsapp_number' => '08999999999',
            'primary_address' => 'Alamat Baru',
            'member_status' => 'member',
            'internal_notes' => 'Catatan admin',
        ])->assertForbidden();
    }

    public function test_submitted_user_id_does_not_mutate_profile_ownership(): void
    {
        $admin = $this->createAdmin();
        $profile = $this->createCustomerProfile();
        $otherUser = User::factory()->create();

        $this->actingAs($admin)->patch(route('admin.customers.update', $profile), [
            'name' => 'Nama Baru',
            'whatsapp_number' => '08999999999',
            'primary_address' => 'Alamat Baru',
            'member_status' => 'member',
            'internal_notes' => 'Catatan admin',
            'user_id' => $otherUser->id,
        ])->assertRedirect(route('admin.customers.show', $profile));

        $this->assertSame($profile->user_id, $profile->fresh()->user_id);
    }

    private function createAdmin(): User
    {
        return User::factory()->adminCentral()->create();
    }

    private function inertiaGet(User $admin, string $url)
    {
        $headers = ['X-Inertia' => 'true'];

        if (file_exists(public_path('build/manifest.json'))) {
            $headers['X-Inertia-Version'] = hash_file('xxh128', public_path('build/manifest.json'));
        }

        return $this->actingAs($admin)->withHeaders($headers)->get($url);
    }

    private function createBranch(): Branch
    {
        return Branch::query()->firstOrCreate(
            ['slug' => 'pusat-test'],
            [
                'name' => 'Pusat Test',
                'code' => 'PSTT',
                'is_active' => true,
            ]
        );
    }

    private function createCustomerProfile(?User $user = null): CustomerProfile
    {
        $user ??= User::factory()->customer()->create();

        return CustomerProfile::query()->create([
            'user_id' => $user->id,
            'name' => 'Customer A',
            'whatsapp_number' => '08123456789',
            'primary_address' => 'Alamat A',
            'member_status' => 'non_member',
            'internal_notes' => 'Catatan awal',
        ]);
    }

    private function createRelatedData(CustomerProfile $profile): void
    {
        $branch = $this->createBranch();
        $service = Service::query()->create([
            'name' => 'Layanan A',
            'slug' => 'layanan-a-'.Service::query()->count(),
            'description' => 'Deskripsi layanan',
            'price' => 150000,
            'visit_type' => 'both',
            'image_path' => null,
            'is_active' => true,
            'is_featured' => false,
        ]);

        $voucher = Voucher::query()->create([
            'code' => 'DISC10-'.Voucher::query()->count(),
            'name' => 'Diskon 10',
            'discount_type' => 'fixed',
            'discount_value' => 10000,
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addDay(),
            'usage_limit' => 10,
            'is_published' => true,
        ]);

        Order::query()->create([
            'order_number' => 'ORD-'.Order::query()->count(),
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

        Booking::query()->create([
            'booking_number' => 'BK-TEST-'.Booking::query()->count(),
            'branch_id' => $branch->id,
            'user_id' => $profile->user_id,
            'customer_profile_id' => $profile->id,
            'service_id' => $service->id,
            'name' => $profile->name,
            'whatsapp_number' => $profile->whatsapp_number,
            'visit_type' => 'home_visit',
            'desired_schedule_at' => now()->addDay(),
            'complaint_notes' => 'Ingin konsultasi.',
            'status' => 'waiting_confirmation',
        ]);

        $redemption = VoucherRedemption::query()->create([
            'voucher_id' => $voucher->id,
            'customer_profile_id' => $profile->id,
            'discount_amount' => 10000,
            'redeemed_at' => now(),
        ]);

        $redemption->load('voucher');
    }
}
