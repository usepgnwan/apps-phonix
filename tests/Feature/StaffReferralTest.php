<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Branch;
use App\Models\BranchProductStock;
use App\Models\CustomerProfile;
use App\Models\Order;
use App\Models\PaymentMethod;
use App\Models\Position;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Service;
use App\Models\StaffReferralClick;
use App\Models\User;
use App\Services\StaffReferral\StaffCodeGenerator;
use App\Services\StaffReferral\StaffReferralAttributionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class StaffReferralTest extends TestCase
{
    use RefreshDatabase;

    public function test_track_valid_staff_code_sets_cookie_and_logs_click(): void
    {
        $staff = User::factory()->fieldStaff($this->createBranch()->id)->create([
            'staff_code' => 'STF-TEST',
            'staff_referral_enabled' => true,
        ]);

        $response = $this->get(route('staff-referral.track', ['staffCode' => 'stf-test']));

        $response->assertRedirect(route('register'));
        $response->assertCookie('staff_ref', 'STF-TEST');

        $this->assertDatabaseHas('staff_referral_clicks', [
            'staff_user_id' => $staff->id,
        ]);
    }

    public function test_track_invalid_staff_code_redirects_without_cookie(): void
    {
        $response = $this->get(route('staff-referral.track', ['staffCode' => 'STF-NONE']));

        $response->assertRedirect(route('register'));
        $this->assertDatabaseCount('staff_referral_clicks', 0);
    }

    public function test_track_rejects_external_redirect_and_uses_register(): void
    {
        User::factory()->fieldStaff($this->createBranch()->id)->create([
            'staff_code' => 'STF-SAFE',
        ]);

        $response = $this->get(route('staff-referral.track', [
            'staffCode' => 'STF-SAFE',
            'redirect' => 'https://evil.example',
        ]));

        $response->assertRedirect(route('register'));
    }

    public function test_register_with_staff_cookie_binds_referred_by_staff(): void
    {
        $staff = User::factory()->fieldStaff($this->createBranch()->id)->create([
            'staff_code' => 'STF-REG1',
            'name' => 'Staff Referral',
        ]);

        StaffReferralClick::query()->create([
            'staff_user_id' => $staff->id,
            'clicked_at' => now(),
            'expires_at' => now()->addDays(30),
        ]);

        $response = $this
            ->withUnencryptedCookie('staff_ref', 'STF-REG1')
            ->post(route('register'), [
                'name' => 'Customer Baru',
                'email' => 'customer-ref@example.test',
                'whatsapp_number' => '081234567890',
                'primary_address' => 'Jl. Mawar No. 1, Jakarta',
                'password' => 'password',
                'password_confirmation' => 'password',
                'staff_ref' => 'STF-REG1',
            ]);

        $response->assertRedirect(route('dashboard', absolute: false));

        $customer = User::query()->where('email', 'customer-ref@example.test')->first();
        $this->assertNotNull($customer);
        $this->assertSame($staff->id, $customer->referred_by_staff_id);
        $this->assertNotNull($customer->referred_at);
        $this->assertDatabaseHas('customer_profiles', [
            'user_id' => $customer->id,
            'internal_notes' => 'Customer mendaftar melalui referral staff Staff Referral (STF-REG1).',
        ]);
        $this->assertDatabaseHas('staff_referral_clicks', [
            'staff_user_id' => $staff->id,
            'registered_user_id' => $customer->id,
        ]);
    }

    public function test_register_without_cookie_leaves_referral_null(): void
    {
        $this->post(route('register'), [
            'name' => 'Customer Biasa',
            'email' => 'customer-plain@example.test',
            'whatsapp_number' => '081234567891',
            'primary_address' => 'Jl. Melati No. 2',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertRedirect(route('dashboard', absolute: false));

        $this->assertDatabaseHas('users', [
            'email' => 'customer-plain@example.test',
            'referred_by_staff_id' => null,
        ]);
    }

    public function test_register_ignores_inactive_staff_cookie(): void
    {
        User::factory()->fieldStaff($this->createBranch()->id)->create([
            'staff_code' => 'STF-DEAD',
            'is_active' => false,
        ]);

        $this->withUnencryptedCookie('staff_ref', 'STF-DEAD')
            ->post(route('register'), [
                'name' => 'Customer Skip',
                'email' => 'customer-skip@example.test',
                'whatsapp_number' => '081234567892',
                'primary_address' => 'Jl. Kenanga',
                'password' => 'password',
                'password_confirmation' => 'password',
                'staff_ref' => 'STF-DEAD',
            ])->assertRedirect(route('dashboard', absolute: false));

        $this->assertDatabaseHas('users', [
            'email' => 'customer-skip@example.test',
            'referred_by_staff_id' => null,
        ]);
    }

    public function test_admin_create_staff_generates_staff_code(): void
    {
        $admin = $this->createAdmin();
        $branch = $this->createBranch();
        $position = Position::query()->firstOrCreate(['name' => 'Executive Premier']);

        $this->actingAs($admin)->post(route('admin.staff.store'), [
            'name' => 'Staff With Code',
            'email' => 'staff-code@example.test',
            'phone_number' => '08111111111',
            'branch_id' => $branch->id,
            'position_id' => $position->id,
            'password' => 'password123',
        ])->assertRedirect(route('admin.staff.index'));

        $staff = User::query()->where('email', 'staff-code@example.test')->first();
        $this->assertNotNull($staff);
        $this->assertNotNull($staff->staff_code);
        $this->assertTrue(str_starts_with($staff->staff_code, 'STF-'));
        $this->assertTrue($staff->staff_referral_enabled);
    }

    public function test_field_staff_can_view_referral_page(): void
    {
        $staff = User::factory()->fieldStaff($this->createBranch()->id)->create([
            'staff_code' => 'STF-VIEW',
        ]);

        User::factory()->customer()->create([
            'referred_by_staff_id' => $staff->id,
            'referred_at' => now(),
            'name' => 'Referred One',
        ]);

        StaffReferralClick::query()->create([
            'staff_user_id' => $staff->id,
            'clicked_at' => now(),
            'expires_at' => now()->addDays(30),
        ]);

        $request = $this->actingAs($staff)->withHeader('X-Inertia', 'true');
        if (file_exists(public_path('build/manifest.json'))) {
            $request->withHeader('X-Inertia-Version', hash_file('xxh128', public_path('build/manifest.json')));
        }

        Order::query()->create([
            'order_number' => 'ORD-REF-1',
            'user_id' => null,
            'customer_profile_id' => null,
            'branch_id' => null,
            'referred_by_staff_id' => $staff->id,
            'payment_method_id' => null,
            'customer_name' => 'Buyer Ref',
            'customer_whatsapp_number' => '0812000000',
            'customer_email' => 'buyer-ref@example.test',
            'shipping_address' => 'Jl. Test',
            'subtotal' => 100000,
            'voucher_discount_amount' => 0,
            'shipping_cost' => 0,
            'total' => 100000,
            'shipping_status' => 'pending_shipping_confirmation',
            'payment_status' => 'pending',
            'status' => 'waiting_shipping_confirmation',
        ]);

        $request->get(route('field.referral.show'))
            ->assertOk()
            ->assertJsonPath('component', 'Field/Referral/Show')
            ->assertJsonPath('props.staffCode', 'STF-VIEW')
            ->assertJsonPath('props.metrics.click_count', 1)
            ->assertJsonPath('props.metrics.registration_count', 1)
            ->assertJsonPath('props.metrics.order_count', 1)
            ->assertJsonPath('props.orders.data.0.order_number', 'ORD-REF-1')
            ->assertJsonPath('props.filters.registrations_per_page', 10)
            ->assertJsonPath('props.filters.orders_per_page', 10);
    }

    public function test_field_staff_referral_page_supports_per_table_search_and_pagination_params(): void
    {
        $staff = User::factory()->fieldStaff($this->createBranch()->id)->create([
            'staff_code' => 'STF-SRCH',
        ]);

        User::factory()->customer()->create([
            'name' => 'Alpha Customer',
            'email' => 'alpha@example.test',
            'referred_by_staff_id' => $staff->id,
            'referred_at' => now(),
        ]);
        User::factory()->customer()->create([
            'name' => 'Beta Customer',
            'email' => 'beta@example.test',
            'referred_by_staff_id' => $staff->id,
            'referred_at' => now(),
        ]);

        $request = $this->actingAs($staff)->withHeader('X-Inertia', 'true');
        if (file_exists(public_path('build/manifest.json'))) {
            $request->withHeader('X-Inertia-Version', hash_file('xxh128', public_path('build/manifest.json')));
        }

        $request->get(route('field.referral.show', [
            'registrations_search' => 'Alpha',
            'registrations_per_page' => 25,
            'orders_search' => 'NoMatch',
            'orders_per_page' => 10,
        ]))
            ->assertOk()
            ->assertJsonPath('component', 'Field/Referral/Show')
            ->assertJsonPath('props.filters.registrations_search', 'Alpha')
            ->assertJsonPath('props.filters.registrations_per_page', 25)
            ->assertJsonPath('props.filters.orders_search', 'NoMatch')
            ->assertJsonPath('props.registrations.data.0.name', 'Alpha Customer')
            ->assertJsonCount(1, 'props.registrations.data')
            ->assertJsonCount(0, 'props.orders.data');
    }

    public function test_staff_code_generator_produces_unique_prefixed_codes(): void
    {
        $generator = app(StaffCodeGenerator::class);
        $code = $generator->generate();

        $this->assertTrue(str_starts_with($code, 'STF-'));
        $this->assertSame(8, strlen($code));
    }

    public function test_resolve_for_transaction_prioritizes_explicit_code_over_profile(): void
    {
        $branch = $this->createBranch();
        $staffA = User::factory()->fieldStaff($branch->id)->create([
            'staff_code' => 'STF-AAAA',
            'staff_referral_enabled' => true,
        ]);
        $staffB = User::factory()->fieldStaff($branch->id)->create([
            'staff_code' => 'STF-BBBB',
            'staff_referral_enabled' => true,
        ]);
        $customer = User::factory()->customer()->create([
            'referred_by_staff_id' => $staffA->id,
            'referred_at' => now(),
        ]);

        $service = app(StaffReferralAttributionService::class);
        $request = Request::create('/checkout', 'POST', ['staff_ref' => 'STF-BBBB']);

        $resolved = $service->resolveForTransaction($customer->id, $request, 'STF-BBBB');

        $this->assertNotNull($resolved);
        $this->assertSame($staffB->id, $resolved->id);
        $this->assertSame($staffA->id, $customer->fresh()->referred_by_staff_id);
    }

    public function test_resolve_for_transaction_falls_back_to_profile_when_input_empty(): void
    {
        $branch = $this->createBranch();
        $staffA = User::factory()->fieldStaff($branch->id)->create([
            'staff_code' => 'STF-FALL',
            'staff_referral_enabled' => true,
        ]);
        $customer = User::factory()->customer()->create([
            'referred_by_staff_id' => $staffA->id,
            'referred_at' => now(),
        ]);

        $service = app(StaffReferralAttributionService::class);
        $request = Request::create('/checkout', 'POST', ['staff_ref' => '']);

        $resolved = $service->resolveForTransaction($customer->id, $request, '');

        $this->assertNotNull($resolved);
        $this->assertSame($staffA->id, $resolved->id);
    }

    public function test_resolve_for_transaction_falls_back_to_profile_when_explicit_code_invalid(): void
    {
        $branch = $this->createBranch();
        $staffA = User::factory()->fieldStaff($branch->id)->create([
            'staff_code' => 'STF-KEEP',
            'staff_referral_enabled' => true,
        ]);
        $customer = User::factory()->customer()->create([
            'referred_by_staff_id' => $staffA->id,
            'referred_at' => now(),
        ]);

        $service = app(StaffReferralAttributionService::class);
        $request = Request::create('/checkout', 'POST', ['staff_ref' => 'STF-NONE']);

        $resolved = $service->resolveForTransaction($customer->id, $request, 'STF-NONE');

        $this->assertNotNull($resolved);
        $this->assertSame($staffA->id, $resolved->id);
    }

    public function test_prefill_for_buyer_returns_profile_staff_code(): void
    {
        $branch = $this->createBranch();
        $staff = User::factory()->fieldStaff($branch->id)->create([
            'name' => 'Staff Prefill',
            'staff_code' => 'STF-PREF',
            'staff_referral_enabled' => true,
        ]);
        $customer = User::factory()->customer()->create([
            'referred_by_staff_id' => $staff->id,
            'referred_at' => now(),
        ]);

        $prefill = app(StaffReferralAttributionService::class)->prefillForBuyer($customer->id);

        $this->assertSame([
            'staff_code' => 'STF-PREF',
            'staff_name' => 'Staff Prefill',
        ], $prefill);
    }

    public function test_guest_checkout_with_staff_ref_binds_order_only(): void
    {
        $branch = $this->createBranch();
        $staff = User::factory()->fieldStaff($branch->id)->create([
            'staff_code' => 'STF-GUST',
            'staff_referral_enabled' => true,
        ]);
        $product = $this->createProductWithBranchStock($branch, 5);
        $paymentMethod = $this->createPaymentMethod();

        $this->post(route('cart.items.store'), [
            'product_id' => $product->id,
            'quantity' => 1,
            'branch_id' => $branch->id,
        ])->assertSessionHasNoErrors();

        $this->post(route('checkout.store'), [
            'customer_name' => 'Guest Ref',
            'customer_whatsapp_number' => '081234567890',
            'customer_email' => 'guest-ref@example.test',
            'payment_method_id' => $paymentMethod->id,
            'shipping_address' => 'Jl. Guest No. 1',
            'staff_ref' => 'STF-GUST',
        ])->assertSessionHasNoErrors();

        $order = Order::query()->firstOrFail();
        $this->assertSame($staff->id, $order->referred_by_staff_id);
        $this->assertNull($order->user_id);
    }

    public function test_checkout_user_profile_a_with_input_b_keeps_profile_and_order_b(): void
    {
        $branch = $this->createBranch();
        $staffA = User::factory()->fieldStaff($branch->id)->create([
            'staff_code' => 'STF-PROA',
            'staff_referral_enabled' => true,
        ]);
        $staffB = User::factory()->fieldStaff($branch->id)->create([
            'staff_code' => 'STF-PROB',
            'staff_referral_enabled' => true,
        ]);
        [$user, $profile] = $this->createCustomer([
            'referred_by_staff_id' => $staffA->id,
            'referred_at' => now(),
        ]);
        $product = $this->createProductWithBranchStock($branch, 5);
        $paymentMethod = $this->createPaymentMethod();

        $this->actingAs($user)->post(route('cart.items.store'), [
            'product_id' => $product->id,
            'quantity' => 1,
            'branch_id' => $branch->id,
        ])->assertSessionHasNoErrors();

        $this->actingAs($user)->post(route('checkout.store'), [
            'customer_name' => $profile->name,
            'customer_whatsapp_number' => $profile->whatsapp_number,
            'customer_email' => $user->email,
            'payment_method_id' => $paymentMethod->id,
            'shipping_address' => $profile->primary_address,
            'staff_ref' => 'STF-PROB',
        ])->assertSessionHasNoErrors();

        $order = Order::query()->firstOrFail();
        $this->assertSame($staffB->id, $order->referred_by_staff_id);
        $this->assertSame($staffA->id, $user->fresh()->referred_by_staff_id);
    }

    public function test_checkout_empty_staff_ref_falls_back_to_profile_staff(): void
    {
        $branch = $this->createBranch();
        $staffA = User::factory()->fieldStaff($branch->id)->create([
            'staff_code' => 'STF-EMPT',
            'staff_referral_enabled' => true,
        ]);
        [$user, $profile] = $this->createCustomer([
            'referred_by_staff_id' => $staffA->id,
            'referred_at' => now(),
        ]);
        $product = $this->createProductWithBranchStock($branch, 5);
        $paymentMethod = $this->createPaymentMethod();

        $this->actingAs($user)->post(route('cart.items.store'), [
            'product_id' => $product->id,
            'quantity' => 1,
            'branch_id' => $branch->id,
        ])->assertSessionHasNoErrors();

        $this->actingAs($user)->post(route('checkout.store'), [
            'customer_name' => $profile->name,
            'customer_whatsapp_number' => $profile->whatsapp_number,
            'customer_email' => $user->email,
            'payment_method_id' => $paymentMethod->id,
            'shipping_address' => $profile->primary_address,
            'staff_ref' => '',
        ])->assertSessionHasNoErrors();

        $order = Order::query()->firstOrFail();
        $this->assertSame($staffA->id, $order->referred_by_staff_id);
        $this->assertSame($staffA->id, $user->fresh()->referred_by_staff_id);
    }

    public function test_checkout_show_prefills_staff_referral_from_profile(): void
    {
        $branch = $this->createBranch();
        $staff = User::factory()->fieldStaff($branch->id)->create([
            'name' => 'Staff Show Prefill',
            'staff_code' => 'STF-SHOW',
            'staff_referral_enabled' => true,
        ]);
        [$user] = $this->createCustomer([
            'referred_by_staff_id' => $staff->id,
            'referred_at' => now(),
        ]);
        $product = $this->createProductWithBranchStock($branch, 3);

        $this->actingAs($user)->post(route('cart.items.store'), [
            'product_id' => $product->id,
            'quantity' => 1,
            'branch_id' => $branch->id,
        ]);

        $headers = ['X-Inertia' => 'true'];
        if (file_exists(public_path('build/manifest.json'))) {
            $headers['X-Inertia-Version'] = hash_file('xxh128', public_path('build/manifest.json'));
        }

        $this->actingAs($user)
            ->withHeaders($headers)
            ->get(route('checkout.show'))
            ->assertOk()
            ->assertJsonPath('component', 'Public/Checkout/Show')
            ->assertJsonPath('props.staffReferralPrefill.staff_code', 'STF-SHOW')
            ->assertJsonPath('props.staffReferralPrefill.staff_name', 'Staff Show Prefill');
    }

    public function test_booking_with_staff_ref_binds_transaction_without_mutating_profile(): void
    {
        $branch = $this->createBranch();
        $staffA = User::factory()->fieldStaff($branch->id)->create([
            'staff_code' => 'STF-BKA',
            'staff_referral_enabled' => true,
        ]);
        $staffB = User::factory()->fieldStaff($branch->id)->create([
            'staff_code' => 'STF-BKB',
            'staff_referral_enabled' => true,
        ]);
        [$user] = $this->createCustomer([
            'referred_by_staff_id' => $staffA->id,
            'referred_at' => now(),
        ]);
        $service = Service::query()->create([
            'name' => 'Konsultasi Referral',
            'slug' => 'konsultasi-referral',
            'description' => 'Layanan test',
            'price' => 100000,
            'visit_type' => 'both',
            'is_active' => true,
            'is_featured' => false,
        ]);

        $this->actingAs($user)->post(route('bookings.store'), [
            'branch_id' => $branch->id,
            'service_id' => $service->id,
            'visit_type' => 'home_visit',
            'desired_schedule_at' => now()->addDay()->format('Y-m-d H:i:s'),
            'complaint_notes' => 'Follow up staf B',
            'staff_ref' => 'STF-BKB',
        ])->assertSessionHasNoErrors();

        $booking = Booking::query()->firstOrFail();
        $this->assertSame($staffB->id, $booking->referred_by_staff_id);
        $this->assertSame($staffA->id, $user->fresh()->referred_by_staff_id);
    }

    public function test_offline_sale_with_staff_ref_sets_referred_by_staff_id(): void
    {
        $branch = $this->createBranch();
        $admin = User::factory()->adminCentral()->create();
        $staffOps = User::factory()->fieldStaff($branch->id)->create([
            'staff_code' => 'STF-OPS1',
            'staff_referral_enabled' => true,
        ]);
        $staffRef = User::factory()->fieldStaff($branch->id)->create([
            'staff_code' => 'STF-REF1',
            'staff_referral_enabled' => true,
        ]);
        $product = $this->createProductWithBranchStock($branch, 10);
        $paymentMethod = $this->createPaymentMethod(['type' => 'cash', 'bank_name' => null, 'account_number' => null, 'account_holder_name' => null]);

        $this->actingAs($admin)->post(route('admin.offline-sales.store'), [
            'branch_id' => $branch->id,
            'customer_profile_id' => null,
            'lead_id' => null,
            'field_staff_id' => $staffOps->id,
            'event_id' => null,
            'source' => 'offline',
            'payment_method_id' => $paymentMethod->id,
            'staff_ref' => 'STF-REF1',
            'customer_name' => 'Walk-in Ref',
            'customer_whatsapp_number' => '081299988877',
            'notes' => null,
            'sold_at' => now()->format('Y-m-d H:i:s'),
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ])->assertSessionHasNoErrors()
            ->assertRedirect(route('admin.offline-sales.index'));

        $this->assertDatabaseHas('offline_sales', [
            'customer_name' => 'Walk-in Ref',
            'field_staff_id' => $staffOps->id,
            'referred_by_staff_id' => $staffRef->id,
        ]);
    }

    public function test_offline_sale_empty_staff_ref_falls_back_to_customer_profile_staff(): void
    {
        $branch = $this->createBranch();
        $admin = User::factory()->adminCentral()->create();
        $staffA = User::factory()->fieldStaff($branch->id)->create([
            'staff_code' => 'STF-OFFA',
            'staff_referral_enabled' => true,
        ]);
        $customer = User::factory()->customer()->create([
            'referred_by_staff_id' => $staffA->id,
            'referred_at' => now(),
        ]);
        $profile = CustomerProfile::query()->create([
            'user_id' => $customer->id,
            'name' => 'Customer Offline Profile',
            'whatsapp_number' => '081211122233',
            'primary_address' => 'Jl. Offline',
            'member_status' => 'non_member',
        ]);
        $product = $this->createProductWithBranchStock($branch, 10);
        $paymentMethod = $this->createPaymentMethod(['type' => 'cash', 'bank_name' => null, 'account_number' => null, 'account_holder_name' => null]);

        $this->actingAs($admin)->post(route('admin.offline-sales.store'), [
            'branch_id' => $branch->id,
            'customer_profile_id' => $profile->id,
            'lead_id' => null,
            'field_staff_id' => null,
            'event_id' => null,
            'source' => 'offline',
            'payment_method_id' => $paymentMethod->id,
            'staff_ref' => '',
            'customer_name' => $profile->name,
            'customer_whatsapp_number' => $profile->whatsapp_number,
            'notes' => null,
            'sold_at' => now()->format('Y-m-d H:i:s'),
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseHas('offline_sales', [
            'customer_profile_id' => $profile->id,
            'referred_by_staff_id' => $staffA->id,
        ]);
        $this->assertSame($staffA->id, $customer->fresh()->referred_by_staff_id);
    }

    private function createAdmin(): User
    {
        return User::factory()->adminCentral()->create();
    }

    private function createBranch(): Branch
    {
        return Branch::query()->create([
            'name' => 'Pusat',
            'slug' => 'pusat-'.Branch::query()->count(),
            'code' => 'P'.Branch::query()->count(),
            'is_active' => true,
        ]);
    }

    private function createCustomer(array $userAttributes = []): array
    {
        $user = User::factory()->customer()->create($userAttributes);
        $profile = CustomerProfile::query()->create([
            'user_id' => $user->id,
            'name' => 'Phoenix Customer',
            'whatsapp_number' => '08123456789',
            'primary_address' => 'Jl. Herbal No. 1',
            'member_status' => 'non_member',
        ]);

        return [$user, $profile];
    }

    private function createProductWithBranchStock(Branch $branch, int $stockQuantity = 10): Product
    {
        $category = ProductCategory::query()->create([
            'name' => 'Herbal Ref',
            'slug' => 'herbal-ref-'.ProductCategory::query()->count(),
            'is_active' => true,
        ]);

        $product = Product::query()->create([
            'product_category_id' => $category->id,
            'name' => 'Produk Referral '.Product::query()->count(),
            'slug' => 'produk-referral-'.Product::query()->count(),
            'price' => 100000,
            'short_description' => 'Deskripsi singkat',
            'full_description' => 'Deskripsi lengkap',
            'is_active' => true,
            'is_featured' => false,
        ]);

        BranchProductStock::query()->create([
            'branch_id' => $branch->id,
            'product_id' => $product->id,
            'stock_quantity' => $stockQuantity,
            'low_stock_threshold' => 1,
        ]);

        return $product;
    }

    private function createPaymentMethod(array $attributes = []): PaymentMethod
    {
        return PaymentMethod::query()->create(array_merge([
            'type' => 'bank_transfer',
            'bank_name' => 'BCA',
            'account_number' => '1234567890',
            'account_holder_name' => 'PT Phoenix',
            'instructions' => 'Transfer ke rekening Phoenix.',
            'is_active' => true,
        ], $attributes));
    }
}
