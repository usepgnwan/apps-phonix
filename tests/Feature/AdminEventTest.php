<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Lead;
use App\Models\LeadSource;
use App\Models\OfflineSale;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminEventTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_admin_events_index(): void
    {
        $this->get(route('admin.events.index'))->assertRedirect(route('login'));
    }

    public function test_non_admin_gets_forbidden(): void
    {
        $user = User::factory()->create(['role' => 'customer', 'is_active' => true]);

        $this->actingAs($user)->get(route('admin.events.index'))->assertForbidden();
    }

    public function test_inactive_admin_gets_forbidden(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => false]);

        $this->actingAs($admin)->get(route('admin.events.index'))->assertForbidden();
    }

    public function test_active_admin_can_view_event_pages_with_relation_counts(): void
    {
        $admin = $this->createAdmin();
        $event = $this->createEvent();
        $this->createLead($event);
        $this->createOfflineSale($event);

        $this->inertiaGet($admin, route('admin.events.index'))
            ->assertOk()
            ->assertJsonPath('component', 'Admin/Events/Index')
            ->assertJsonPath('props.events.0.leads_count', 1)
            ->assertJsonPath('props.events.0.offline_sales_count', 1);

        $this->inertiaGet($admin, route('admin.events.create'))
            ->assertOk()
            ->assertJsonPath('component', 'Admin/Events/Create');

        $this->inertiaGet($admin, route('admin.events.show', $event))
            ->assertOk()
            ->assertJsonPath('component', 'Admin/Events/Show')
            ->assertJsonPath('props.event.leads_count', 1)
            ->assertJsonPath('props.event.offline_sales_count', 1);

        $this->inertiaGet($admin, route('admin.events.edit', $event))
            ->assertOk()
            ->assertJsonPath('component', 'Admin/Events/Edit')
            ->assertJsonPath('props.event.id', $event->id);
    }

    public function test_active_admin_can_store_event(): void
    {
        $admin = $this->createAdmin();

        $this->actingAs($admin)->post(route('admin.events.store'), $this->eventPayload())
            ->assertRedirect(route('admin.events.index'));

        $this->assertDatabaseHas('events', [
            'name' => 'Pameran Herbal',
            'event_date' => now()->addDay()->startOfDay()->format('Y-m-d H:i:s'),
            'location' => 'Jakarta',
            'organizer' => 'Komunitas Herbal',
            'notes' => 'Event promosi herbal',
        ]);
    }

    public function test_active_admin_can_store_event_with_nullable_optional_fields(): void
    {
        $admin = $this->createAdmin();

        $this->actingAs($admin)->post(route('admin.events.store'), [
            'name' => 'Pemeriksaan Gratis',
            'event_date' => now()->addDay()->toDateString(),
            'location' => 'Bandung',
            'organizer' => null,
            'notes' => null,
        ])->assertRedirect(route('admin.events.index'));

        $this->assertDatabaseHas('events', [
            'name' => 'Pemeriksaan Gratis',
            'organizer' => null,
            'notes' => null,
        ]);
    }

    public function test_active_admin_can_update_event(): void
    {
        $admin = $this->createAdmin();
        $event = $this->createEvent();

        $this->actingAs($admin)->patch(route('admin.events.update', $event), [
            'name' => 'Pameran Herbal Baru',
            'event_date' => now()->addDays(2)->toDateString(),
            'location' => 'Surabaya',
            'organizer' => 'Tim Phoenix',
            'notes' => 'Catatan diperbarui',
        ])->assertRedirect(route('admin.events.index'));

        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'name' => 'Pameran Herbal Baru',
            'location' => 'Surabaya',
            'organizer' => 'Tim Phoenix',
            'notes' => 'Catatan diperbarui',
        ]);
    }

    public function test_invalid_event_fields_are_rejected(): void
    {
        $admin = $this->createAdmin();
        $event = $this->createEvent();

        $this->actingAs($admin)->post(route('admin.events.store'), [
            'name' => null,
            'event_date' => 'invalid',
            'location' => null,
            'organizer' => str_repeat('a', 256),
            'notes' => [],
        ])->assertSessionHasErrors(['name', 'event_date', 'location', 'organizer', 'notes']);

        $this->actingAs($admin)->patch(route('admin.events.update', $event), [
            'name' => str_repeat('a', 256),
            'event_date' => now()->toDateString(),
            'location' => str_repeat('b', 256),
            'organizer' => null,
            'notes' => null,
        ])->assertSessionHasErrors(['name', 'location']);
    }

    public function test_active_admin_can_delete_unused_event(): void
    {
        $admin = $this->createAdmin();
        $event = $this->createEvent();

        $this->actingAs($admin)->delete(route('admin.events.destroy', $event))
            ->assertRedirect(route('admin.events.index'))
            ->assertSessionHas('success');

        $this->assertModelMissing($event);
    }

    public function test_event_delete_is_blocked_when_leads_exist(): void
    {
        $admin = $this->createAdmin();
        $event = $this->createEvent();
        $this->createLead($event);

        $this->actingAs($admin)->delete(route('admin.events.destroy', $event))
            ->assertRedirect(route('admin.events.index'))
            ->assertSessionHas('error');

        $this->assertDatabaseHas('events', ['id' => $event->id]);
    }

    public function test_event_delete_is_blocked_when_offline_sales_exist(): void
    {
        $admin = $this->createAdmin();
        $event = $this->createEvent();
        $this->createOfflineSale($event);

        $this->actingAs($admin)->delete(route('admin.events.destroy', $event))
            ->assertRedirect(route('admin.events.index'))
            ->assertSessionHas('error');

        $this->assertDatabaseHas('events', ['id' => $event->id]);
    }

    public function test_non_admin_cannot_mutate_event(): void
    {
        $user = User::factory()->create(['role' => 'customer', 'is_active' => true]);
        $event = $this->createEvent();

        $this->actingAs($user)->post(route('admin.events.store'), $this->eventPayload())->assertForbidden();

        $this->actingAs($user)->patch(route('admin.events.update', $event), $this->eventPayload())->assertForbidden();
    }

    private function createAdmin(): User
    {
        return User::factory()->create(['role' => 'admin', 'is_active' => true]);
    }

    private function inertiaGet(User $admin, string $url): \Illuminate\Testing\TestResponse
    {
        $request = $this->actingAs($admin)->withHeader('X-Inertia', 'true');

        if (file_exists(public_path('build/manifest.json'))) {
            $request->withHeader('X-Inertia-Version', hash_file('xxh128', public_path('build/manifest.json')));
        }

        return $request->get($url);
    }

    private function createEvent(array $attributes = []): Event
    {
        $index = Event::query()->count() + 1;

        return Event::query()->create(array_merge([
            'name' => 'Event '.$index,
            'event_date' => now()->addDay()->toDateString(),
            'location' => 'Lokasi '.$index,
            'organizer' => 'Organizer '.$index,
            'notes' => 'Catatan event',
        ], $attributes));
    }

    private function createLead(Event $event): Lead
    {
        $leadSource = LeadSource::query()->create([
            'name' => 'Event Source '.$event->id,
            'slug' => 'event-source-'.$event->id,
            'is_active' => true,
        ]);

        return Lead::query()->create([
            'lead_source_id' => $leadSource->id,
            'event_id' => $event->id,
            'name' => 'Prospek Event',
            'whatsapp_number' => '08123456789',
            'follow_up_status' => 'new',
        ]);
    }

    private function createOfflineSale(Event $event): OfflineSale
    {
        return OfflineSale::query()->create([
            'sale_number' => 'OFF-'.str_pad((string) (OfflineSale::query()->count() + 1), 6, '0', STR_PAD_LEFT),
            'event_id' => $event->id,
            'source' => 'event',
            'customer_name' => 'Customer Offline',
            'customer_whatsapp_number' => '08123456789',
            'total' => 150000,
            'notes' => 'Penjualan event',
            'sold_at' => now(),
        ]);
    }

    private function eventPayload(): array
    {
        return [
            'name' => 'Pameran Herbal',
            'event_date' => now()->addDay()->toDateString(),
            'location' => 'Jakarta',
            'organizer' => 'Komunitas Herbal',
            'notes' => 'Event promosi herbal',
        ];
    }
}
