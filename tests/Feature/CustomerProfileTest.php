<?php

namespace Tests\Feature;

use App\Models\CustomerProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_customer_profile_routes_and_mutations(): void
    {
        $this->get(route('customer.profile.show'))->assertRedirect(route('login'));
        $this->get(route('customer.profile.create'))->assertRedirect(route('login'));
        $this->get(route('customer.profile.edit'))->assertRedirect(route('login'));
        $this->post(route('customer.profile.store'), [])->assertRedirect(route('login'));
        $this->patch(route('customer.profile.update'), [])->assertRedirect(route('login'));
    }

    public function test_authenticated_user_without_profile_can_view_create_placeholder(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->withHeader('X-Inertia', 'true')->get(route('customer.profile.create'));

        $response->assertOk()
            ->assertJsonPath('component', 'Welcome')
            ->assertJsonPath('props.page', 'customer.profile.create');
    }

    public function test_authenticated_user_can_store_customer_profile(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('customer.profile.store'), [
            'name' => 'Customer Satu',
            'whatsapp_number' => '08123456789',
            'primary_address' => 'Jl. Mawar No. 1',
        ]);

        $response->assertRedirect(route('customer.dashboard.index'))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('customer_profiles', [
            'user_id' => $user->id,
            'name' => 'Customer Satu',
            'whatsapp_number' => '08123456789',
            'primary_address' => 'Jl. Mawar No. 1',
            'member_status' => 'non_member',
        ]);
    }

    public function test_store_cannot_create_duplicate_profile_for_user(): void
    {
        $user = User::factory()->create();

        CustomerProfile::query()->create([
            'user_id' => $user->id,
            'name' => 'Customer Existing',
            'whatsapp_number' => '08111111111',
            'primary_address' => 'Jl. Lama No. 1',
            'member_status' => 'non_member',
        ]);

        $response = $this->actingAs($user)->post(route('customer.profile.store'), [
            'name' => 'Customer Baru',
            'whatsapp_number' => '08222222222',
            'primary_address' => 'Jl. Baru No. 2',
        ]);

        $response->assertRedirect(route('customer.profile.edit'));

        $this->assertSame(1, CustomerProfile::query()->where('user_id', $user->id)->count());
    }

    public function test_authenticated_user_with_profile_can_view_show_and_edit_placeholders(): void
    {
        $user = User::factory()->create();
        $profile = CustomerProfile::query()->create([
            'user_id' => $user->id,
            'name' => 'Customer Satu',
            'whatsapp_number' => '08123456789',
            'primary_address' => 'Jl. Mawar No. 1',
            'member_status' => 'member',
        ]);

        $show = $this->actingAs($user)->withHeader('X-Inertia', 'true')->get(route('customer.profile.show'));
        $edit = $this->actingAs($user)->withHeader('X-Inertia', 'true')->get(route('customer.profile.edit'));

        $show->assertOk()
            ->assertJsonPath('component', 'Welcome')
            ->assertJsonPath('props.page', 'customer.profile.show')
            ->assertJsonPath('props.customerProfile.id', $profile->id);

        $edit->assertOk()
            ->assertJsonPath('component', 'Welcome')
            ->assertJsonPath('props.page', 'customer.profile.edit')
            ->assertJsonPath('props.customerProfile.id', $profile->id);
    }

    public function test_user_can_update_own_customer_profile_data(): void
    {
        $user = User::factory()->create();
        $profile = CustomerProfile::query()->create([
            'user_id' => $user->id,
            'name' => 'Customer Lama',
            'whatsapp_number' => '08111111111',
            'primary_address' => 'Jl. Lama No. 1',
            'member_status' => 'member',
            'internal_notes' => 'Catatan lama',
        ]);

        $response = $this->actingAs($user)->patch(route('customer.profile.update'), [
            'name' => 'Customer Baru',
            'whatsapp_number' => '08222222222',
            'primary_address' => 'Jl. Baru No. 2',
        ]);

        $response->assertRedirect(route('customer.profile.show'))
            ->assertSessionHas('success');

        $profile->refresh();

        $this->assertSame('Customer Baru', $profile->name);
        $this->assertSame('08222222222', $profile->whatsapp_number);
        $this->assertSame('Jl. Baru No. 2', $profile->primary_address);
    }

    public function test_submitted_internal_fields_do_not_mutate_customer_profile(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post(route('customer.profile.store'), [
            'name' => 'Customer Satu',
            'whatsapp_number' => '08123456789',
            'primary_address' => 'Jl. Mawar No. 1',
            'member_status' => 'member',
            'internal_notes' => 'Harus diabaikan',
        ]);

        $profile = CustomerProfile::query()->where('user_id', $user->id)->firstOrFail();

        $this->assertSame('non_member', $profile->member_status);
        $this->assertNull($profile->internal_notes);
    }

    public function test_after_creating_profile_customer_dashboard_is_accessible(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post(route('customer.profile.store'), [
            'name' => 'Customer Satu',
            'whatsapp_number' => '08123456789',
            'primary_address' => 'Jl. Mawar No. 1',
        ]);

        $response = $this->actingAs($user)->withHeader('X-Inertia', 'true')->get(route('customer.dashboard.index'));

        $response->assertOk()
            ->assertJsonPath('component', 'Welcome')
            ->assertJsonPath('props.page', 'customer.dashboard.index');
    }
}
