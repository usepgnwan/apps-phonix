<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\CustomerProfile;
use App\Models\PaymentMethod;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminPaymentMethodTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_admin_payment_methods_index(): void
    {
        $this->get(route('admin.payment-methods.index'))->assertRedirect(route('login'));
    }

    public function test_authenticated_non_admin_gets_forbidden(): void
    {
        $user = User::factory()->create(['role' => 'customer', 'is_active' => true]);

        $this->actingAs($user)->get(route('admin.payment-methods.index'))->assertForbidden();
    }

    public function test_inactive_admin_gets_forbidden(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => false]);

        $this->actingAs($admin)->get(route('admin.payment-methods.index'))->assertForbidden();
    }

    public function test_active_admin_can_view_payment_method_pages_with_counts(): void
    {
        $admin = $this->createAdmin();
        $paymentMethod = $this->createPaymentMethod();

        $this->inertiaGet($admin, route('admin.payment-methods.index'))
            ->assertOk()
            ->assertJsonPath('component', 'Admin/PaymentMethods/Index')
            ->assertJsonPath('props.page', 'admin.payment-methods.index')
            ->assertJsonStructure(['props' => ['paymentMethods']]);

        $this->inertiaGet($admin, route('admin.payment-methods.create'))
            ->assertOk()
            ->assertJsonPath('component', 'Admin/PaymentMethods/Create')
            ->assertJsonPath('props.page', 'admin.payment-methods.create');

        $this->inertiaGet($admin, route('admin.payment-methods.show', $paymentMethod))
            ->assertOk()
            ->assertJsonPath('component', 'Admin/PaymentMethods/Show')
            ->assertJsonPath('props.page', 'admin.payment-methods.show')
            ->assertJsonPath('props.paymentMethod.orders_count', 0);

        $this->inertiaGet($admin, route('admin.payment-methods.edit', $paymentMethod))
            ->assertOk()
            ->assertJsonPath('component', 'Admin/PaymentMethods/Edit')
            ->assertJsonPath('props.page', 'admin.payment-methods.edit')
            ->assertJsonPath('props.paymentMethod.id', $paymentMethod->id);
    }

    public function test_active_admin_can_create_bank_transfer_payment_method(): void
    {
        $admin = $this->createAdmin();

        $response = $this->actingAs($admin)->post(route('admin.payment-methods.store'), $this->bankTransferPayload());

        $response->assertRedirect(route('admin.payment-methods.index'))->assertSessionHas('success');

        $this->assertDatabaseHas('payment_methods', [
            'type' => 'bank_transfer',
            'bank_name' => 'BCA',
            'account_number' => '1234567890',
            'account_holder_name' => 'PT Phoenix',
            'qris_image_path' => null,
            'is_active' => true,
        ]);
    }

    public function test_active_admin_can_create_qris_payment_method(): void
    {
        Storage::fake('public');
        $admin = $this->createAdmin();

        $response = $this->actingAs($admin)->post(route('admin.payment-methods.store'), $this->qrisPayload());

        $response->assertRedirect(route('admin.payment-methods.index'))->assertSessionHas('success');

        $paymentMethod = PaymentMethod::query()->where('type', 'qris')->firstOrFail();

        $this->assertDatabaseHas('payment_methods', [
            'id' => $paymentMethod->id,
            'type' => 'qris',
            'bank_name' => null,
            'account_number' => null,
            'account_holder_name' => null,
            'is_active' => true,
        ]);

        $this->assertStringStartsWith('payment-methods/', $paymentMethod->qris_image_path);
        $this->assertTrue(Storage::disk('public')->exists($paymentMethod->qris_image_path));
    }

    public function test_active_admin_can_update_payment_method(): void
    {
        $admin = $this->createAdmin();
        $paymentMethod = $this->createPaymentMethod();

        $response = $this->actingAs($admin)->put(route('admin.payment-methods.update', $paymentMethod), array_merge($this->bankTransferPayload(), [
            'bank_name' => 'Mandiri',
            'account_number' => '9876543210',
            'account_holder_name' => 'PT Phoenix Baru',
            'instructions' => 'Update instruksi',
            'is_active' => false,
        ]));

        $response->assertRedirect(route('admin.payment-methods.index'))->assertSessionHas('success');

        $this->assertDatabaseHas('payment_methods', [
            'id' => $paymentMethod->id,
            'type' => 'bank_transfer',
            'bank_name' => 'Mandiri',
            'account_number' => '9876543210',
            'account_holder_name' => 'PT Phoenix Baru',
            'is_active' => false,
        ]);
    }

    public function test_active_admin_can_update_qris_payment_method_with_new_upload(): void
    {
        Storage::fake('public');
        $admin = $this->createAdmin();
        $paymentMethod = $this->createPaymentMethod([
            'type' => 'qris',
            'qris_image_path' => 'payment-methods/old-qris.png',
        ]);

        $response = $this->actingAs($admin)->post(route('admin.payment-methods.update', $paymentMethod), $this->qrisPayload([
            'qris_image' => UploadedFile::fake()->image('new-qris.webp'),
            'instructions' => 'Scan QRIS terbaru',
            'is_active' => false,
            '_method' => 'put',
        ]));

        $response->assertRedirect(route('admin.payment-methods.index'))->assertSessionHas('success');

        $paymentMethod->refresh();

        $this->assertSame('qris', $paymentMethod->type);
        $this->assertSame('Scan QRIS terbaru', $paymentMethod->instructions);
        $this->assertFalse($paymentMethod->is_active);
        $this->assertStringStartsWith('payment-methods/', $paymentMethod->qris_image_path);
        $this->assertNotSame('payment-methods/old-qris.png', $paymentMethod->qris_image_path);
        $this->assertTrue(Storage::disk('public')->exists($paymentMethod->qris_image_path));
    }

    public function test_active_admin_can_keep_existing_qris_image_when_updating_without_upload(): void
    {
        $admin = $this->createAdmin();
        $paymentMethod = $this->createPaymentMethod([
            'type' => 'qris',
            'qris_image_path' => 'payment-methods/existing-qris.png',
        ]);

        $response = $this->actingAs($admin)->post(route('admin.payment-methods.update', $paymentMethod), [
            'type' => 'qris',
            'bank_name' => null,
            'account_number' => null,
            'account_holder_name' => null,
            'instructions' => 'Scan QRIS existing',
            'is_active' => true,
            '_method' => 'put',
        ]);

        $response->assertRedirect(route('admin.payment-methods.index'))->assertSessionHas('success');

        $this->assertDatabaseHas('payment_methods', [
            'id' => $paymentMethod->id,
            'type' => 'qris',
            'qris_image_path' => 'payment-methods/existing-qris.png',
            'instructions' => 'Scan QRIS existing',
        ]);
    }

    public function test_invalid_payment_method_fields_are_rejected(): void
    {
        $admin = $this->createAdmin();
        $paymentMethod = $this->createPaymentMethod();

        $this->actingAs($admin)->post(route('admin.payment-methods.store'), array_merge($this->bankTransferPayload(), ['type' => 'bad']))->assertSessionHasErrors('type');
        $this->actingAs($admin)->post(route('admin.payment-methods.store'), array_merge($this->bankTransferPayload(), ['bank_name' => null]))->assertSessionHasErrors('bank_name');
        $this->actingAs($admin)->post(route('admin.payment-methods.store'), array_merge($this->qrisPayload(), ['qris_image' => null]))->assertSessionHasErrors('qris_image');
        $this->actingAs($admin)->post(route('admin.payment-methods.store'), array_merge($this->qrisPayload(), ['qris_image' => UploadedFile::fake()->create('qris.pdf', 100, 'application/pdf')]))->assertSessionHasErrors('qris_image');
        $this->actingAs($admin)->put(route('admin.payment-methods.update', $paymentMethod), array_merge($this->qrisPayload(), ['qris_image' => null]))->assertSessionHasErrors('qris_image');
        $this->actingAs($admin)->put(route('admin.payment-methods.update', $paymentMethod), array_merge($this->bankTransferPayload(), ['is_active' => null]))->assertSessionHasErrors('is_active');
    }

    public function test_active_admin_can_delete_payment_method_without_orders(): void
    {
        $admin = $this->createAdmin();
        $paymentMethod = $this->createPaymentMethod();

        $this->actingAs($admin)->delete(route('admin.payment-methods.destroy', $paymentMethod))
            ->assertRedirect(route('admin.payment-methods.index'))
            ->assertSessionHas('success');

        $this->assertModelMissing($paymentMethod);
    }

    public function test_deletion_is_blocked_when_payment_method_has_orders(): void
    {
        $admin = $this->createAdmin();
        $paymentMethod = $this->createPaymentMethod();
        $this->createOrder($paymentMethod);

        $this->actingAs($admin)->delete(route('admin.payment-methods.destroy', $paymentMethod))
            ->assertRedirect(route('admin.payment-methods.index'))
            ->assertSessionHas('error');

        $this->assertDatabaseHas('payment_methods', ['id' => $paymentMethod->id]);
    }

    private function createAdmin(): User
    {
        return User::factory()->create(['role' => 'admin', 'is_active' => true]);
    }

    private function inertiaGet(User $admin, string $url)
    {
        $request = $this->actingAs($admin)->withHeader('X-Inertia', 'true');

        if (file_exists(public_path('build/manifest.json'))) {
            $request = $request->withHeader('X-Inertia-Version', hash_file('xxh128', public_path('build/manifest.json')));
        }

        return $request->get($url);
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

    private function createOrder(PaymentMethod $paymentMethod): Order
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

        return Order::query()->create([
            'order_number' => 'ORD-'.Order::query()->count(),
            'user_id' => $user->id,
            'customer_profile_id' => $profile->id,
            'voucher_id' => $voucher->id,
            'payment_method_id' => $paymentMethod->id,
            'customer_name' => 'Customer A',
            'customer_whatsapp_number' => '08123456789',
            'shipping_address' => 'Alamat A',
            'subtotal' => 100000,
            'voucher_discount_amount' => 0,
            'shipping_cost' => 0,
            'total' => 100000,
            'shipping_status' => 'pending_shipping_confirmation',
            'payment_status' => 'pending',
            'status' => 'waiting_shipping_confirmation',
        ]);
    }

    private function bankTransferPayload(array $overrides = []): array
    {
        return array_merge([
            'type' => 'bank_transfer',
            'bank_name' => 'BCA',
            'account_number' => '1234567890',
            'account_holder_name' => 'PT Phoenix',
            'qris_image_path' => null,
            'instructions' => 'Transfer ke rekening',
            'is_active' => true,
        ], $overrides);
    }

    private function qrisPayload(array $overrides = []): array
    {
        return array_merge([
            'type' => 'qris',
            'bank_name' => null,
            'account_number' => null,
            'account_holder_name' => null,
            'qris_image' => UploadedFile::fake()->image('qris.png'),
            'instructions' => 'Scan QRIS',
            'is_active' => true,
        ], $overrides);
    }
}
