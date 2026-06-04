<?php

namespace Tests\Feature;

use App\Models\Lead;
use App\Models\LeadSource;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminLeadSourceTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_admin_lead_sources_index(): void
    {
        $this->get(route('admin.lead-sources.index'))->assertRedirect(route('login'));
    }

    public function test_non_admin_gets_forbidden(): void
    {
        $user = User::factory()->create(['role' => 'customer', 'is_active' => true]);

        $this->actingAs($user)->get(route('admin.lead-sources.index'))->assertForbidden();
    }

    public function test_inactive_admin_gets_forbidden(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => false]);

        $this->actingAs($admin)->get(route('admin.lead-sources.index'))->assertForbidden();
    }

    public function test_active_admin_can_view_placeholders_with_leads_count(): void
    {
        $admin = $this->createAdmin();
        $leadSource = LeadSource::query()->create(['name' => 'Instagram', 'slug' => 'instagram-'.(LeadSource::query()->count() + 1), 'is_active' => true]);
        $this->createLead($leadSource);

        $this->actingAs($admin)->withHeader('X-Inertia', 'true')->get(route('admin.lead-sources.index'))
            ->assertOk()
            ->assertJsonPath('component', 'Welcome')
            ->assertJsonPath('props.page', 'admin.lead-sources.index')
            ->assertJsonPath('props.leadSources.0.leads_count', 1);

        $this->actingAs($admin)->withHeader('X-Inertia', 'true')->get(route('admin.lead-sources.create'))
            ->assertOk()
            ->assertJsonPath('component', 'Welcome')
            ->assertJsonPath('props.page', 'admin.lead-sources.create');

        $this->actingAs($admin)->withHeader('X-Inertia', 'true')->get(route('admin.lead-sources.show', $leadSource))
            ->assertOk()
            ->assertJsonPath('component', 'Welcome')
            ->assertJsonPath('props.page', 'admin.lead-sources.show')
            ->assertJsonPath('props.leadSource.leads_count', 1);

        $this->actingAs($admin)->withHeader('X-Inertia', 'true')->get(route('admin.lead-sources.edit', $leadSource))
            ->assertOk()
            ->assertJsonPath('component', 'Welcome')
            ->assertJsonPath('props.page', 'admin.lead-sources.edit')
            ->assertJsonPath('props.leadSource.id', $leadSource->id);
    }

    public function test_active_admin_can_store_lead_source(): void
    {
        $admin = $this->createAdmin();

        $this->actingAs($admin)->post(route('admin.lead-sources.store'), [
            'name' => 'Referral',
            'slug' => 'referral',
            'is_active' => true,
        ])->assertRedirect(route('admin.lead-sources.index'));

        $this->assertDatabaseHas('lead_sources', [
            'name' => 'Referral',
            'slug' => 'referral',
            'is_active' => true,
        ]);
    }

    public function test_active_admin_can_update_lead_source(): void
    {
        $admin = $this->createAdmin();
        $leadSource = LeadSource::query()->create(['name' => 'Instagram', 'slug' => 'instagram-'.(LeadSource::query()->count() + 1), 'is_active' => true]);

        $this->actingAs($admin)->patch(route('admin.lead-sources.update', $leadSource), [
            'name' => 'Instagram Ads',
            'slug' => 'instagram-ads',
            'is_active' => false,
        ])->assertRedirect(route('admin.lead-sources.index'));

        $this->assertDatabaseHas('lead_sources', [
            'id' => $leadSource->id,
            'name' => 'Instagram Ads',
            'slug' => 'instagram-ads',
            'is_active' => false,
        ]);
    }

    public function test_invalid_and_duplicate_lead_source_fields_are_rejected(): void
    {
        $admin = $this->createAdmin();
        $leadSource = LeadSource::query()->create(['name' => 'Instagram', 'slug' => 'instagram', 'is_active' => true]);
        $other = LeadSource::query()->create(['name' => 'Referral', 'slug' => 'referral', 'is_active' => true]);

        $this->actingAs($admin)->post(route('admin.lead-sources.store'), [
            'name' => null,
            'slug' => 'website',
            'is_active' => true,
        ])->assertSessionHasErrors('name');

        $this->actingAs($admin)->post(route('admin.lead-sources.store'), [
            'name' => 'Instagram Baru',
            'slug' => 'instagram',
            'is_active' => true,
        ])->assertSessionHasErrors('slug');

        $this->actingAs($admin)->patch(route('admin.lead-sources.update', $other), [
            'name' => 'Referral Baru',
            'slug' => 'instagram',
            'is_active' => true,
        ])->assertSessionHasErrors('slug');

        $this->actingAs($admin)->patch(route('admin.lead-sources.update', $leadSource), [
            'name' => 'Instagram',
            'slug' => 'instagram',
            'is_active' => true,
        ])->assertRedirect(route('admin.lead-sources.index'));
    }

    public function test_active_admin_can_delete_unused_lead_source(): void
    {
        $admin = $this->createAdmin();
        $leadSource = LeadSource::query()->create(['name' => 'Instagram', 'slug' => 'instagram-'.(LeadSource::query()->count() + 1), 'is_active' => true]);

        $this->actingAs($admin)->delete(route('admin.lead-sources.destroy', $leadSource))
            ->assertRedirect(route('admin.lead-sources.index'))
            ->assertSessionHas('success');

        $this->assertModelMissing($leadSource);
    }

    public function test_lead_source_delete_is_blocked_when_leads_exist(): void
    {
        $admin = $this->createAdmin();
        $leadSource = LeadSource::query()->create(['name' => 'Instagram', 'slug' => 'instagram-'.(LeadSource::query()->count() + 1), 'is_active' => true]);
        $this->createLead($leadSource);

        $this->actingAs($admin)->delete(route('admin.lead-sources.destroy', $leadSource))
            ->assertRedirect(route('admin.lead-sources.index'))
            ->assertSessionHas('error');

        $this->assertDatabaseHas('lead_sources', ['id' => $leadSource->id]);
    }

    public function test_non_admin_cannot_mutate_lead_source(): void
    {
        $user = User::factory()->create(['role' => 'customer', 'is_active' => true]);
        $leadSource = LeadSource::query()->create(['name' => 'Instagram', 'slug' => 'instagram-'.(LeadSource::query()->count() + 1), 'is_active' => true]);

        $this->actingAs($user)->post(route('admin.lead-sources.store'), [
            'name' => 'Referral',
            'slug' => 'referral',
            'is_active' => true,
        ])->assertForbidden();

        $this->actingAs($user)->patch(route('admin.lead-sources.update', $leadSource), [
            'name' => 'Instagram Ads',
            'slug' => 'instagram-ads',
            'is_active' => false,
        ])->assertForbidden();
    }

    private function createAdmin(): User
    {
        return User::factory()->create(['role' => 'admin', 'is_active' => true]);
    }

    private function createLead(LeadSource $leadSource): Lead
    {
        return Lead::query()->create([
            'lead_source_id' => $leadSource->id,
            'name' => 'Prospek A',
            'whatsapp_number' => '08123456789',
            'follow_up_status' => 'new',
        ]);
    }
}
