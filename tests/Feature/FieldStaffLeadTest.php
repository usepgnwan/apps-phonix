<?php

namespace Tests\Feature;

use App\Models\CustomerProfile;
use App\Models\Event;
use App\Models\FieldActivity;
use App\Models\Lead;
use App\Models\LeadSource;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FieldStaffLeadTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_field_dashboard(): void
    {
        $this->get(route('field.dashboard.index'))->assertRedirect(route('login'));
    }

    public function test_non_field_staff_gets_forbidden(): void
    {
        $user = User::factory()->create(['role' => 'customer', 'is_active' => true]);

        $this->actingAs($user)->get(route('field.dashboard.index'))->assertForbidden();
    }

    public function test_inactive_field_staff_gets_forbidden(): void
    {
        $fieldStaff = $this->createFieldStaff(['is_active' => false]);

        $this->actingAs($fieldStaff)->get(route('field.dashboard.index'))->assertForbidden();
    }

    public function test_active_field_staff_can_view_dashboard_summary_page(): void
    {
        $fieldStaff = $this->createFieldStaff();
        $lead = $this->createLead($fieldStaff, ['follow_up_status' => 'needs_follow_up']);
        $this->createLead($fieldStaff, ['follow_up_status' => 'purchased']);
        $this->createLead($this->createFieldStaff());
        FieldActivity::query()->create([
            'field_staff_id' => $fieldStaff->id,
            'lead_id' => $lead->id,
            'activity_type' => 'visit',
            'activity_at' => now(),
            'notes' => 'Kunjungan awal',
            'follow_up_status' => 'needs_follow_up',
        ]);

        $this->inertiaGet($fieldStaff, route('field.dashboard.index'))
            ->assertOk()
            ->assertJsonPath('component', 'Field/Dashboard')
            ->assertJsonPath('props.summary.assignedLeadsCount', 2)
            ->assertJsonPath('props.summary.openLeadsCount', 1)
            ->assertJsonPath('props.summary.activitiesCount', 1);
    }

    public function test_active_field_staff_can_view_only_assigned_leads_index_page(): void
    {
        $fieldStaff = $this->createFieldStaff();
        $this->createLead($fieldStaff, ['name' => 'Lead Milik Staff']);
        $this->createLead($this->createFieldStaff(), ['name' => 'Lead Staff Lain']);

        $response = $this->inertiaGet($fieldStaff, route('field.leads.index'));

        $response->assertOk()
            ->assertJsonPath('component', 'Field/Leads/Index')
            ->assertJsonPath('props.leads.data.0.name', 'Lead Milik Staff')
            ->assertJsonMissingPath('props.leads.data.1');
    }

    public function test_active_field_staff_can_view_assigned_lead_detail_page(): void
    {
        $fieldStaff = $this->createFieldStaff();
        $lead = $this->createLead($fieldStaff);

        $this->inertiaGet($fieldStaff, route('field.leads.show', $lead))
            ->assertOk()
            ->assertJsonPath('component', 'Field/Leads/Show')
            ->assertJsonPath('props.lead.id', $lead->id)
            ->assertJsonPath('props.activityTypes.0', 'visit')
            ->assertJsonPath('props.leadStatuses.0', 'new');
    }

    public function test_field_staff_cannot_view_other_staff_lead(): void
    {
        $fieldStaff = $this->createFieldStaff();
        $otherLead = $this->createLead($this->createFieldStaff());

        $this->actingAs($fieldStaff)->get(route('field.leads.show', $otherLead))->assertNotFound();
    }

    public function test_field_staff_can_update_assigned_lead_status(): void
    {
        $fieldStaff = $this->createFieldStaff();
        $lead = $this->createLead($fieldStaff);

        $this->actingAs($fieldStaff)->patch(route('field.leads.status.update', $lead), [
            'follow_up_status' => 'interested',
        ])->assertRedirect(route('field.leads.show', $lead));

        $this->assertDatabaseHas('leads', [
            'id' => $lead->id,
            'follow_up_status' => 'interested',
        ]);
    }

    public function test_field_staff_cannot_update_other_staff_lead_status(): void
    {
        $fieldStaff = $this->createFieldStaff();
        $otherLead = $this->createLead($this->createFieldStaff());

        $this->actingAs($fieldStaff)->patch(route('field.leads.status.update', $otherLead), [
            'follow_up_status' => 'interested',
        ])->assertForbidden();
    }

    public function test_invalid_field_lead_status_is_rejected(): void
    {
        $fieldStaff = $this->createFieldStaff();
        $lead = $this->createLead($fieldStaff);

        $this->actingAs($fieldStaff)->patch(route('field.leads.status.update', $lead), [
            'follow_up_status' => 'invalid',
        ])->assertSessionHasErrors('follow_up_status');
    }

    public function test_field_staff_can_create_activity_for_assigned_lead(): void
    {
        $fieldStaff = $this->createFieldStaff();
        $lead = $this->createLead($fieldStaff);
        $activityAt = now()->format('Y-m-d H:i:s');

        $this->actingAs($fieldStaff)->post(route('field.leads.activities.store', $lead), [
            'activity_type' => 'follow_up',
            'activity_at' => $activityAt,
            'notes' => 'Hubungi ulang via WhatsApp',
            'follow_up_status' => 'needs_follow_up',
        ])->assertRedirect(route('field.leads.show', $lead));

        $this->assertDatabaseHas('field_activities', [
            'field_staff_id' => $fieldStaff->id,
            'lead_id' => $lead->id,
            'activity_type' => 'follow_up',
            'notes' => 'Hubungi ulang via WhatsApp',
            'follow_up_status' => 'needs_follow_up',
        ]);

        $this->assertSame('new', $lead->fresh()->follow_up_status);
    }

    public function test_activity_creation_allows_nullable_follow_up_status(): void
    {
        $fieldStaff = $this->createFieldStaff();
        $lead = $this->createLead($fieldStaff);

        $this->actingAs($fieldStaff)->post(route('field.leads.activities.store', $lead), [
            'activity_type' => 'note',
            'activity_at' => now()->format('Y-m-d H:i:s'),
            'notes' => 'Catatan lapangan',
            'follow_up_status' => null,
        ])->assertRedirect(route('field.leads.show', $lead));

        $this->assertDatabaseHas('field_activities', [
            'field_staff_id' => $fieldStaff->id,
            'lead_id' => $lead->id,
            'activity_type' => 'note',
            'follow_up_status' => null,
        ]);
    }

    public function test_activity_creation_rejects_invalid_type_and_status(): void
    {
        $fieldStaff = $this->createFieldStaff();
        $lead = $this->createLead($fieldStaff);

        $this->actingAs($fieldStaff)->post(route('field.leads.activities.store', $lead), [
            'activity_type' => 'invalid',
            'activity_at' => now()->format('Y-m-d H:i:s'),
            'notes' => 'Catatan',
            'follow_up_status' => 'invalid',
        ])->assertSessionHasErrors(['activity_type', 'follow_up_status']);
    }

    public function test_activity_creation_rejects_spoofed_staff_and_lead_ids(): void
    {
        $fieldStaff = $this->createFieldStaff();
        $lead = $this->createLead($fieldStaff);

        $this->actingAs($fieldStaff)->post(route('field.leads.activities.store', $lead), [
            'activity_type' => 'visit',
            'activity_at' => now()->format('Y-m-d H:i:s'),
            'notes' => 'Kunjungan',
            'follow_up_status' => 'interested',
            'field_staff_id' => $this->createFieldStaff()->id,
            'lead_id' => $this->createLead($fieldStaff)->id,
        ])->assertSessionHasErrors(['field_staff_id', 'lead_id']);
    }

    public function test_field_staff_cannot_create_activity_for_other_staff_lead(): void
    {
        $fieldStaff = $this->createFieldStaff();
        $otherLead = $this->createLead($this->createFieldStaff());

        $this->actingAs($fieldStaff)->post(route('field.leads.activities.store', $otherLead), [
            'activity_type' => 'visit',
            'activity_at' => now()->format('Y-m-d H:i:s'),
            'notes' => 'Kunjungan',
            'follow_up_status' => 'interested',
        ])->assertForbidden();
    }

    private function createFieldStaff(array $attributes = []): User
    {
        return User::factory()->create(array_merge(['role' => 'field_staff', 'is_active' => true], $attributes));
    }

    private function inertiaGet(User $fieldStaff, string $url): \Illuminate\Testing\TestResponse
    {
        $request = $this->actingAs($fieldStaff)->withHeader('X-Inertia', 'true');

        if (file_exists(public_path('build/manifest.json'))) {
            $request->withHeader('X-Inertia-Version', hash_file('xxh128', public_path('build/manifest.json')));
        }

        return $request->get($url);
    }

    private function createLead(User $fieldStaff, array $attributes = []): Lead
    {
        $index = Lead::query()->count() + 1;
        $customerUser = User::factory()->create(['role' => 'customer', 'is_active' => true]);
        $customerProfile = CustomerProfile::query()->create([
            'user_id' => $customerUser->id,
            'name' => 'Customer '.$index,
            'whatsapp_number' => '0812345678'.$index,
            'primary_address' => 'Alamat Customer '.$index,
            'member_status' => 'non_member',
        ]);
        $leadSource = LeadSource::query()->create([
            'name' => 'Door to Door '.$index,
            'slug' => 'door-to-door-'.$index,
            'is_active' => true,
        ]);
        $event = Event::query()->create([
            'name' => 'Event '.$index,
            'start_date' => now()->addDay()->toDateString(),
            'end_date' => now()->addDay()->toDateString(),
            'is_active' => true,
            'location' => 'Lokasi '.$index,
            'organizer' => 'Organizer '.$index,
            'notes' => 'Catatan event',
        ]);

        return Lead::query()->create(array_merge([
            'assigned_staff_id' => $fieldStaff->id,
            'customer_profile_id' => $customerProfile->id,
            'lead_source_id' => $leadSource->id,
            'event_id' => $event->id,
            'name' => 'Prospek '.$index,
            'whatsapp_number' => '0898765432'.$index,
            'address' => 'Alamat prospek '.$index,
            'interested_product_notes' => 'Produk herbal',
            'interested_service_notes' => 'Konsultasi',
            'initial_complaint' => 'Keluhan awal',
            'follow_up_status' => 'new',
            'internal_notes' => 'Catatan internal',
        ], $attributes));
    }
}
