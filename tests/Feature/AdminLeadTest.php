<?php

namespace Tests\Feature;

use App\Models\CustomerProfile;
use App\Models\Event;
use App\Models\Lead;
use App\Models\LeadFollowUp;
use App\Models\LeadSource;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminLeadTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_admin_leads_index(): void
    {
        $this->get(route('admin.leads.index'))->assertRedirect(route('login'));
    }

    public function test_non_admin_gets_forbidden(): void
    {
        $user = User::factory()->create(['role' => 'customer', 'is_active' => true]);

        $this->actingAs($user)->get(route('admin.leads.index'))->assertForbidden();
    }

    public function test_inactive_admin_gets_forbidden(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => false]);

        $this->actingAs($admin)->get(route('admin.leads.index'))->assertForbidden();
    }

    public function test_active_admin_can_view_create_placeholder(): void
    {
        $admin = $this->createAdmin();
        $this->seedLeadRelations();

        $this->actingAs($admin)->withHeader('X-Inertia', 'true')->get(route('admin.leads.create'))
            ->assertOk()
            ->assertJsonPath('component', 'Welcome')
            ->assertJsonPath('props.page', 'admin.leads.create')
            ->assertJsonPath('props.leadStatuses.0', 'new');
    }

    public function test_active_admin_can_view_index_placeholder_with_relations(): void
    {
        $admin = $this->createAdmin();
        $this->createLead();

        $this->actingAs($admin)->withHeader('X-Inertia', 'true')->get(route('admin.leads.index'))
            ->assertOk()
            ->assertJsonPath('component', 'Welcome')
            ->assertJsonPath('props.page', 'admin.leads.index')
            ->assertJsonPath('props.leads.0.lead_source.name', 'Instagram')
            ->assertJsonPath('props.leads.0.assigned_staff.id', $this->lastAssignedStaffId())
            ->assertJsonPath('props.leads.0.customer_profile.name', 'Customer A')
            ->assertJsonPath('props.leads.0.event.name', 'Event A');
    }

    public function test_active_admin_can_store_lead(): void
    {
        $admin = $this->createAdmin();
        $this->seedLeadRelations();

        $this->actingAs($admin)->post(route('admin.leads.store'), $this->leadPayload())
            ->assertRedirect(route('admin.leads.index'));

        $this->assertDatabaseHas('leads', [
            'name' => 'Prospek A',
            'whatsapp_number' => '08123456789',
            'follow_up_status' => 'new',
        ]);
    }

    public function test_lead_validation_rejects_invalid_status(): void
    {
        $admin = $this->createAdmin();
        $this->seedLeadRelations();

        $payload = $this->leadPayload();
        $payload['follow_up_status'] = 'invalid';

        $this->actingAs($admin)->post(route('admin.leads.store'), $payload)
            ->assertSessionHasErrors('follow_up_status');
    }

    public function test_lead_validation_rejects_invalid_foreign_keys(): void
    {
        $admin = $this->createAdmin();
        $this->seedLeadRelations();
        $payload = $this->leadPayload();

        foreach (['assigned_staff_id', 'customer_profile_id', 'lead_source_id', 'event_id'] as $field) {
            $invalidPayload = $payload;
            $invalidPayload[$field] = 999999;

            $this->actingAs($admin)->post(route('admin.leads.store'), $invalidPayload)->assertSessionHasErrors($field);
        }
    }

    public function test_active_admin_can_update_lead_and_show_placeholder(): void
    {
        $admin = $this->createAdmin();
        $lead = $this->createLead();
        $this->seedLeadRelations();

        $this->actingAs($admin)->patch(route('admin.leads.update', $lead), array_merge($this->leadPayload(), ['name' => 'Prospek B']))
            ->assertRedirect(route('admin.leads.show', $lead));

        $this->actingAs($admin)->withHeader('X-Inertia', 'true')->get(route('admin.leads.show', $lead))
            ->assertOk()
            ->assertJsonPath('component', 'Welcome')
            ->assertJsonPath('props.page', 'admin.leads.show')
            ->assertJsonStructure(['props' => ['lead' => ['lead_source', 'assigned_staff', 'customer_profile', 'event', 'lead_follow_ups']]]);

        $this->assertDatabaseHas('leads', ['id' => $lead->id, 'name' => 'Prospek B']);
    }

    public function test_status_update_persists_status(): void
    {
        $admin = $this->createAdmin();
        $lead = $this->createLead();

        $this->actingAs($admin)->patch(route('admin.leads.status.update', $lead), [
            'follow_up_status' => 'interested',
        ])->assertRedirect(route('admin.leads.show', $lead));

        $this->assertDatabaseHas('leads', [
            'id' => $lead->id,
            'follow_up_status' => 'interested',
        ]);
    }

    public function test_invalid_status_update_is_rejected(): void
    {
        $admin = $this->createAdmin();
        $lead = $this->createLead();

        $this->actingAs($admin)->patch(route('admin.leads.status.update', $lead), [
            'follow_up_status' => 'invalid',
        ])->assertSessionHasErrors('follow_up_status');
    }

    public function test_follow_up_creation_uses_current_user_and_does_not_mutate_parent_status(): void
    {
        $admin = $this->createAdmin();
        $lead = $this->createLead();

        $this->actingAs($admin)->post(route('admin.leads.follow-ups.store', $lead), [
            'status' => 'needs_follow_up',
            'notes' => 'Hubungi ulang besok',
            'followed_up_at' => now()->format('Y-m-d H:i:s'),
        ])->assertRedirect(route('admin.leads.show', $lead));

        $followUp = LeadFollowUp::query()->latest()->first();

        $this->assertSame($admin->id, $followUp->user_id);
        $this->assertSame('new', $lead->fresh()->follow_up_status);
    }

    public function test_follow_up_user_id_cannot_be_spoofed(): void
    {
        $admin = $this->createAdmin();
        $lead = $this->createLead();

        $this->actingAs($admin)->post(route('admin.leads.follow-ups.store', $lead), [
            'status' => 'needs_follow_up',
            'notes' => 'Hubungi ulang besok',
            'followed_up_at' => now()->format('Y-m-d H:i:s'),
            'user_id' => User::factory()->create()->id,
        ])->assertSessionHasErrors('user_id');
    }

    public function test_invalid_follow_up_fields_are_rejected(): void
    {
        $admin = $this->createAdmin();
        $lead = $this->createLead();

        $this->actingAs($admin)->post(route('admin.leads.follow-ups.store', $lead), [
            'status' => 'invalid',
            'notes' => 'Hubungi ulang besok',
            'followed_up_at' => now()->format('Y-m-d H:i:s'),
        ])->assertSessionHasErrors('status');

        $this->actingAs($admin)->post(route('admin.leads.follow-ups.store', $lead), [
            'status' => 'needs_follow_up',
            'notes' => null,
            'followed_up_at' => now()->format('Y-m-d H:i:s'),
        ])->assertSessionHasErrors('notes');

        $this->actingAs($admin)->post(route('admin.leads.follow-ups.store', $lead), [
            'status' => 'needs_follow_up',
            'notes' => 'Hubungi ulang besok',
            'followed_up_at' => 'invalid',
        ])->assertSessionHasErrors('followed_up_at');
    }

    public function test_non_admin_cannot_mutate_lead(): void
    {
        $user = User::factory()->create(['role' => 'customer', 'is_active' => true]);
        $lead = $this->createLead();

        $this->actingAs($user)->post(route('admin.leads.store'), $this->leadPayload())->assertForbidden();
        $this->actingAs($user)->patch(route('admin.leads.update', $lead), array_merge($this->leadPayload(), ['name' => 'Prospek B']))->assertForbidden();
        $this->actingAs($user)->patch(route('admin.leads.status.update', $lead), ['follow_up_status' => 'interested'])->assertForbidden();
        $this->actingAs($user)->post(route('admin.leads.follow-ups.store', $lead), [
            'status' => 'needs_follow_up',
            'notes' => 'Catatan',
            'followed_up_at' => now()->format('Y-m-d H:i:s'),
        ])->assertForbidden();
    }

    private function createAdmin(): User
    {
        return User::factory()->create(['role' => 'admin', 'is_active' => true]);
    }

    private function seedLeadRelations(): array
    {
        $index = LeadSource::query()->count() + 1;
        $leadSource = LeadSource::query()->create(['name' => 'Instagram', 'slug' => 'instagram-'.$index, 'is_active' => true]);
        $customerUser = User::factory()->create();
        $staffUser = User::factory()->create();
        $customerProfile = CustomerProfile::query()->create([
            'user_id' => $customerUser->id,
            'name' => 'Customer A',
            'whatsapp_number' => '08123456789',
            'primary_address' => 'Alamat A',
            'member_status' => 'non_member',
        ]);
        $event = Event::query()->create([
            'name' => 'Event A',
            'event_date' => now()->addDay()->toDateString(),
            'location' => 'Lokasi A',
            'organizer' => 'Organizer A',
            'notes' => 'Catatan',
        ]);

        return compact('leadSource', 'customerProfile', 'event', 'staffUser');
    }

    private function lastAssignedStaffId(): int
    {
        return User::query()->latest('id')->value('id');
    }

    private function createLead(): Lead
    {
        $relations = $this->seedLeadRelations();

        return Lead::query()->create([
            'assigned_staff_id' => $relations['staffUser']->id,
            'customer_profile_id' => $relations['customerProfile']->id,
            'lead_source_id' => $relations['leadSource']->id,
            'event_id' => $relations['event']->id,
            'name' => 'Prospek A',
            'whatsapp_number' => '08123456789',
            'address' => 'Alamat prospek',
            'interested_product_notes' => 'Produk A',
            'interested_service_notes' => 'Service A',
            'initial_complaint' => 'Keluhan A',
            'follow_up_status' => 'new',
            'internal_notes' => 'Catatan internal',
        ]);
    }

    private function leadPayload(): array
    {
        $relations = $this->seedLeadRelations();

        return [
            'assigned_staff_id' => $relations['staffUser']->id,
            'customer_profile_id' => $relations['customerProfile']->id,
            'lead_source_id' => $relations['leadSource']->id,
            'event_id' => $relations['event']->id,
            'name' => 'Prospek A',
            'whatsapp_number' => '08123456789',
            'address' => 'Alamat prospek',
            'interested_product_notes' => 'Produk A',
            'interested_service_notes' => 'Service A',
            'initial_complaint' => 'Keluhan A',
            'follow_up_status' => 'new',
            'internal_notes' => 'Catatan internal',
        ];
    }
}
