<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\CustomerProfile;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminBookingTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_admin_bookings_index(): void
    {
        $this->get(route('admin.bookings.index'))->assertRedirect(route('login'));
    }

    public function test_authenticated_non_admin_gets_forbidden(): void
    {
        $user = User::factory()->create(['role' => 'customer', 'is_active' => true]);

        $this->actingAs($user)->get(route('admin.bookings.index'))->assertForbidden();
    }

    public function test_inactive_admin_gets_forbidden(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => false]);

        $this->actingAs($admin)->get(route('admin.bookings.index'))->assertForbidden();
    }

    public function test_active_admin_can_view_index_placeholder(): void
    {
        $admin = $this->createAdmin();
        $this->createBooking();

        $this->actingAs($admin)->withHeader('X-Inertia', 'true')->get(route('admin.bookings.index'))
            ->assertOk()
            ->assertJsonPath('component', 'Welcome')
            ->assertJsonPath('props.page', 'admin.bookings.index')
            ->assertJsonStructure(['props' => ['bookings']]);
    }

    public function test_active_admin_can_view_show_placeholder_with_relations(): void
    {
        $admin = $this->createAdmin();
        $booking = $this->createBooking();

        $this->actingAs($admin)->withHeader('X-Inertia', 'true')->get(route('admin.bookings.show', $booking))
            ->assertOk()
            ->assertJsonPath('component', 'Welcome')
            ->assertJsonPath('props.page', 'admin.bookings.show')
            ->assertJsonStructure([
                'props' => [
                    'booking' => [
                        'user',
                        'customer_profile',
                        'service',
                    ],
                ],
            ]);
    }

    public function test_status_update_persists_status_and_admin_notes(): void
    {
        $admin = $this->createAdmin();
        $booking = $this->createBooking();

        $response = $this->actingAs($admin)->patch(route('admin.bookings.status.update', $booking), [
            'status' => 'confirmed',
            'admin_notes' => 'Dikonfirmasi',
        ]);

        $response->assertRedirect(route('admin.bookings.show', $booking));

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'confirmed',
            'admin_notes' => 'Dikonfirmasi',
        ]);
    }

    public function test_invalid_status_is_rejected(): void
    {
        $admin = $this->createAdmin();
        $booking = $this->createBooking();

        $this->actingAs($admin)->patch(route('admin.bookings.status.update', $booking), [
            'status' => 'invalid',
            'admin_notes' => null,
        ])->assertSessionHasErrors('status');
    }

    public function test_non_admin_cannot_update_status(): void
    {
        $user = User::factory()->create(['role' => 'customer', 'is_active' => true]);
        $booking = $this->createBooking();

        $this->actingAs($user)->patch(route('admin.bookings.status.update', $booking), [
            'status' => 'confirmed',
            'admin_notes' => null,
        ])->assertForbidden();
    }

    public function test_schedule_update_persists_schedule_and_admin_notes(): void
    {
        $admin = $this->createAdmin();
        $booking = $this->createBooking();
        $schedule = now()->addDay()->format('Y-m-d H:i:s');

        $response = $this->actingAs($admin)->patch(route('admin.bookings.schedule.update', $booking), [
            'desired_schedule_at' => $schedule,
            'admin_notes' => 'Jadwal diubah',
        ]);

        $response->assertRedirect(route('admin.bookings.show', $booking));

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'admin_notes' => 'Jadwal diubah',
        ]);

        $this->assertSame($schedule, $booking->fresh()->desired_schedule_at->format('Y-m-d H:i:s'));
    }

    public function test_invalid_or_past_schedule_is_rejected(): void
    {
        $admin = $this->createAdmin();
        $booking = $this->createBooking();

        $this->actingAs($admin)->patch(route('admin.bookings.schedule.update', $booking), [
            'desired_schedule_at' => now()->subHour()->format('Y-m-d H:i:s'),
            'admin_notes' => null,
        ])->assertSessionHasErrors('desired_schedule_at');

        $this->actingAs($admin)->patch(route('admin.bookings.schedule.update', $booking), [
            'desired_schedule_at' => 'invalid',
            'admin_notes' => null,
        ])->assertSessionHasErrors('desired_schedule_at');
    }

    public function test_non_admin_cannot_update_schedule(): void
    {
        $user = User::factory()->create(['role' => 'customer', 'is_active' => true]);
        $booking = $this->createBooking();

        $this->actingAs($user)->patch(route('admin.bookings.schedule.update', $booking), [
            'desired_schedule_at' => now()->addDay()->format('Y-m-d H:i:s'),
            'admin_notes' => null,
        ])->assertForbidden();
    }

    private function createAdmin(): User
    {
        return User::factory()->create(['role' => 'admin', 'is_active' => true]);
    }

    private function createBooking(): Booking
    {
        $user = User::factory()->create();
        $profile = CustomerProfile::query()->create([
            'user_id' => $user->id,
            'name' => 'Customer A',
            'whatsapp_number' => '08123456789',
            'primary_address' => 'Alamat A',
            'member_status' => 'member',
        ]);
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

        return Booking::query()->create([
            'booking_number' => 'BK-TEST-'.Booking::query()->count(),
            'user_id' => $user->id,
            'customer_profile_id' => $profile->id,
            'service_id' => $service->id,
            'name' => $profile->name,
            'whatsapp_number' => $profile->whatsapp_number,
            'visit_type' => 'home_visit',
            'desired_schedule_at' => now()->addDay(),
            'complaint_notes' => 'Ingin konsultasi.',
            'status' => 'waiting_confirmation',
        ]);
    }
}
