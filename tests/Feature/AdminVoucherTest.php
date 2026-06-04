<?php

namespace Tests\Feature;

use App\Models\CustomerProfile;
use App\Models\Order;
use App\Models\User;
use App\Models\Voucher;
use App\Models\VoucherRedemption;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminVoucherTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_admin_vouchers_index(): void
    {
        $this->get(route('admin.vouchers.index'))->assertRedirect(route('login'));
    }

    public function test_authenticated_non_admin_gets_forbidden(): void
    {
        $user = User::factory()->create(['role' => 'customer', 'is_active' => true]);

        $this->actingAs($user)->get(route('admin.vouchers.index'))->assertForbidden();
    }

    public function test_active_admin_can_view_index_create_show_edit_placeholders(): void
    {
        $admin = $this->createAdmin();
        $voucher = $this->createVoucher();

        $this->actingAs($admin)->withHeader('X-Inertia', 'true')->get(route('admin.vouchers.index'))
            ->assertOk()->assertJsonPath('component', 'Welcome')->assertJsonPath('props.page', 'admin.vouchers.index')->assertJsonStructure(['props' => ['vouchers']]);

        $this->actingAs($admin)->withHeader('X-Inertia', 'true')->get(route('admin.vouchers.create'))
            ->assertOk()->assertJsonPath('component', 'Welcome')->assertJsonPath('props.page', 'admin.vouchers.create');

        $this->actingAs($admin)->withHeader('X-Inertia', 'true')->get(route('admin.vouchers.show', $voucher))
            ->assertOk()->assertJsonPath('component', 'Welcome')->assertJsonPath('props.page', 'admin.vouchers.show')->assertJsonStructure(['props' => ['voucher' => ['orders_count', 'voucher_redemptions_count']]]);

        $this->actingAs($admin)->withHeader('X-Inertia', 'true')->get(route('admin.vouchers.edit', $voucher))
            ->assertOk()->assertJsonPath('component', 'Welcome')->assertJsonPath('props.page', 'admin.vouchers.edit')->assertJsonPath('props.voucher.id', $voucher->id);
    }

    public function test_active_admin_can_create_voucher_and_code_is_normalized(): void
    {
        $admin = $this->createAdmin();

        $response = $this->actingAs($admin)->post(route('admin.vouchers.store'), $this->voucherPayload(['code' => 'disc10']));

        $response->assertRedirect(route('admin.vouchers.index'))->assertSessionHas('success');

        $this->assertDatabaseHas('vouchers', ['code' => 'DISC10', 'name' => 'Voucher Diskon']);
    }

    public function test_active_admin_can_update_voucher_and_code_is_normalized(): void
    {
        $admin = $this->createAdmin();
        $voucher = $this->createVoucher(['code' => 'OLD10']);

        $response = $this->actingAs($admin)->put(route('admin.vouchers.update', $voucher), $this->voucherPayload(['code' => 'new10']));

        $response->assertRedirect(route('admin.vouchers.index'))->assertSessionHas('success');

        $this->assertDatabaseHas('vouchers', ['id' => $voucher->id, 'code' => 'NEW10', 'name' => 'Voucher Diskon']);
    }

    public function test_active_admin_can_delete_voucher_with_no_orders_or_redemptions(): void
    {
        $admin = $this->createAdmin();
        $voucher = $this->createVoucher();

        $response = $this->actingAs($admin)->delete(route('admin.vouchers.destroy', $voucher));

        $response->assertRedirect(route('admin.vouchers.index'))->assertSessionHas('success');
        $this->assertModelMissing($voucher);
    }

    public function test_unique_code_validation_works_on_create_and_update_including_unchanged_own_code_allowed(): void
    {
        $admin = $this->createAdmin();
        $voucher = $this->createVoucher(['code' => 'DISC20']);
        $other = $this->createVoucher(['code' => 'DISC30']);

        $this->actingAs($admin)->post(route('admin.vouchers.store'), $this->voucherPayload(['code' => 'disc20']))->assertSessionHasErrors('code');
        $this->actingAs($admin)->put(route('admin.vouchers.update', $other), $this->voucherPayload(['code' => 'disc20']))->assertSessionHasErrors('code');

        $this->actingAs($admin)->put(route('admin.vouchers.update', $voucher), $this->voucherPayload(['code' => 'DISC20']))->assertRedirect(route('admin.vouchers.index'));
    }

    public function test_invalid_voucher_fields_are_rejected(): void
    {
        $admin = $this->createAdmin();

        $base = $this->voucherPayload();

        $this->actingAs($admin)->post(route('admin.vouchers.store'), array_merge($base, ['discount_type' => 'bad']))->assertSessionHasErrors('discount_type');
        $this->actingAs($admin)->post(route('admin.vouchers.store'), array_merge($base, ['discount_type' => 'percentage', 'discount_value' => 150]))->assertSessionHasErrors('discount_value');
        $this->actingAs($admin)->post(route('admin.vouchers.store'), array_merge($base, ['discount_value' => -1]))->assertSessionHasErrors('discount_value');
        $this->actingAs($admin)->post(route('admin.vouchers.store'), array_merge($base, ['ends_at' => now()->subDay()->toDateTimeString()]))->assertSessionHasErrors('ends_at');
        $this->actingAs($admin)->post(route('admin.vouchers.store'), array_merge($base, ['usage_limit' => 0]))->assertSessionHasErrors('usage_limit');
        $this->actingAs($admin)->post(route('admin.vouchers.store'), array_merge($base, ['is_published' => null]))->assertSessionHasErrors('is_published');
    }

    public function test_deletion_is_blocked_when_voucher_has_redemptions(): void
    {
        $admin = $this->createAdmin();
        $voucher = $this->createVoucher();
        $profile = $this->createProfile();
        $order = $this->createOrder($profile, $voucher);

        VoucherRedemption::query()->create([
            'voucher_id' => $voucher->id,
            'customer_profile_id' => $profile->id,
            'order_id' => $order->id,
            'discount_amount' => 10000,
            'redeemed_at' => now(),
        ]);

        $this->actingAs($admin)->delete(route('admin.vouchers.destroy', $voucher))
            ->assertRedirect(route('admin.vouchers.index'))
            ->assertSessionHas('error');

        $this->assertDatabaseHas('vouchers', ['id' => $voucher->id]);
    }

    public function test_deletion_is_blocked_when_voucher_has_orders(): void
    {
        $admin = $this->createAdmin();
        $voucher = $this->createVoucher();
        $profile = $this->createProfile();
        $this->createOrder($profile, $voucher);

        $this->actingAs($admin)->delete(route('admin.vouchers.destroy', $voucher))
            ->assertRedirect(route('admin.vouchers.index'))
            ->assertSessionHas('error');

        $this->assertDatabaseHas('vouchers', ['id' => $voucher->id]);
    }

    public function test_redemption_listing_endpoint_renders_expected_props(): void
    {
        $admin = $this->createAdmin();
        $voucher = $this->createVoucher();
        $profile = $this->createProfile();
        $order = $this->createOrder($profile, $voucher);

        VoucherRedemption::query()->create([
            'voucher_id' => $voucher->id,
            'customer_profile_id' => $profile->id,
            'order_id' => $order->id,
            'discount_amount' => 10000,
            'redeemed_at' => now(),
        ]);

        $this->actingAs($admin)->withHeader('X-Inertia', 'true')->get(route('admin.vouchers.redemptions.index', $voucher))
            ->assertOk()->assertJsonPath('component', 'Welcome')->assertJsonPath('props.page', 'admin.vouchers.redemptions.index')->assertJsonPath('props.voucher.id', $voucher->id)->assertJsonPath('props.redemptions.0.customer_profile.id', $profile->id)->assertJsonPath('props.redemptions.0.order.id', $order->id);
    }

    private function createAdmin(): User
    {
        return User::factory()->create(['role' => 'admin', 'is_active' => true]);
    }

    private function createVoucher(array $attributes = []): Voucher
    {
        return Voucher::query()->create(array_merge([
            'code' => 'DISC10',
            'name' => 'Voucher Diskon',
            'description' => null,
            'discount_type' => 'fixed',
            'discount_value' => 10000,
            'minimum_purchase' => null,
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addDay(),
            'usage_limit' => 10,
            'is_published' => true,
        ], $attributes));
    }

    private function createProfile(): CustomerProfile
    {
        $user = User::factory()->create();

        return CustomerProfile::query()->create([
            'user_id' => $user->id,
            'name' => 'Customer A',
            'whatsapp_number' => '08123456789',
            'primary_address' => 'Alamat A',
            'member_status' => 'member',
        ]);
    }

    private function createOrder(CustomerProfile $profile, Voucher $voucher): Order
    {
        return Order::query()->create([
            'order_number' => 'ORD-'.Order::query()->count(),
            'user_id' => $profile->user_id,
            'customer_profile_id' => $profile->id,
            'voucher_id' => $voucher->id,
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
    }

    private function voucherPayload(array $overrides = []): array
    {
        return array_merge([
            'code' => 'DISC10',
            'name' => 'Voucher Diskon',
            'description' => null,
            'discount_type' => 'fixed',
            'discount_value' => 10000,
            'minimum_purchase' => null,
            'starts_at' => now()->toDateTimeString(),
            'ends_at' => now()->addDay()->toDateTimeString(),
            'usage_limit' => 10,
            'is_published' => true,
        ], $overrides);
    }
}
