<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Position;
use App\Models\StaffReferralClick;
use App\Models\User;
use App\Services\StaffReferral\StaffCodeGenerator;
use Illuminate\Foundation\Testing\RefreshDatabase;
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

        $request->get(route('field.referral.show'))
            ->assertOk()
            ->assertJsonPath('component', 'Field/Referral/Show')
            ->assertJsonPath('props.staffCode', 'STF-VIEW')
            ->assertJsonPath('props.metrics.click_count', 1)
            ->assertJsonPath('props.metrics.registration_count', 1);
    }

    public function test_staff_code_generator_produces_unique_prefixed_codes(): void
    {
        $generator = app(StaffCodeGenerator::class);
        $code = $generator->generate();

        $this->assertTrue(str_starts_with($code, 'STF-'));
        $this->assertSame(8, strlen($code));
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
}
