<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\CustomerProfile;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_create_booking(): void
    {
        $service = $this->createService();

        $response = $this->post(route('bookings.store'), [
            'service_id' => $service->id,
            'visit_type' => 'home_visit',
            'desired_schedule_at' => now()->addDay()->format('Y-m-d H:i:s'),
            'complaint_notes' => 'Ingin konsultasi herbal.',
        ]);

        $response->assertRedirect(route('login'));
        $this->assertDatabaseCount('bookings', 0);
    }

    public function test_authenticated_customer_without_profile_cannot_create_booking(): void
    {
        $user = User::factory()->create();
        $service = $this->createService();

        $response = $this->actingAs($user)->post(route('bookings.store'), [
            'service_id' => $service->id,
            'visit_type' => 'home_visit',
            'desired_schedule_at' => now()->addDay()->format('Y-m-d H:i:s'),
            'complaint_notes' => 'Ingin konsultasi herbal.',
        ]);

        $response->assertSessionHasErrors('customer_profile');
        $this->assertDatabaseCount('bookings', 0);
    }

    public function test_booking_requires_active_service(): void
    {
        [$user] = $this->createCustomer();
        $service = $this->createService(isActive: false);

        $response = $this->actingAs($user)->post(route('bookings.store'), [
            'service_id' => $service->id,
            'visit_type' => 'home_visit',
            'desired_schedule_at' => now()->addDay()->format('Y-m-d H:i:s'),
            'complaint_notes' => 'Ingin konsultasi herbal.',
        ]);

        $response->assertSessionHasErrors('service_id');
        $this->assertDatabaseCount('bookings', 0);
    }

    public function test_booking_rejects_invalid_visit_type(): void
    {
        [$user] = $this->createCustomer();
        $service = $this->createService(visitType: 'both');

        $response = $this->actingAs($user)->post(route('bookings.store'), [
            'service_id' => $service->id,
            'visit_type' => 'clinic_visit',
            'desired_schedule_at' => now()->addDay()->format('Y-m-d H:i:s'),
            'complaint_notes' => 'Ingin konsultasi herbal.',
        ]);

        $response->assertSessionHasErrors('visit_type');
        $this->assertDatabaseCount('bookings', 0);
    }

    public function test_booking_rejects_visit_type_not_supported_by_service(): void
    {
        [$user] = $this->createCustomer();
        $service = $this->createService(visitType: 'office_visit');

        $response = $this->actingAs($user)->post(route('bookings.store'), [
            'service_id' => $service->id,
            'visit_type' => 'home_visit',
            'desired_schedule_at' => now()->addDay()->format('Y-m-d H:i:s'),
            'complaint_notes' => 'Ingin konsultasi herbal.',
        ]);

        $response->assertSessionHasErrors('visit_type');
        $this->assertDatabaseCount('bookings', 0);
    }

    public function test_booking_accepts_home_or_office_when_service_supports_both(): void
    {
        [$user] = $this->createCustomer();
        $service = $this->createService(visitType: 'both');

        $homeResponse = $this->actingAs($user)->post(route('bookings.store'), [
            'service_id' => $service->id,
            'visit_type' => 'home_visit',
            'desired_schedule_at' => now()->addDay()->format('Y-m-d H:i:s'),
            'complaint_notes' => 'Ingin home visit.',
        ]);
        $officeResponse = $this->actingAs($user)->post(route('bookings.store'), [
            'service_id' => $service->id,
            'visit_type' => 'office_visit',
            'desired_schedule_at' => now()->addDays(2)->format('Y-m-d H:i:s'),
            'complaint_notes' => 'Ingin office visit.',
        ]);

        $homeResponse->assertSessionHasNoErrors();
        $officeResponse->assertSessionHasNoErrors();
        $this->assertDatabaseCount('bookings', 2);
    }

    public function test_booking_requires_future_desired_schedule(): void
    {
        [$user] = $this->createCustomer();
        $service = $this->createService();

        $response = $this->actingAs($user)->post(route('bookings.store'), [
            'service_id' => $service->id,
            'visit_type' => 'home_visit',
            'desired_schedule_at' => now()->subHour()->format('Y-m-d H:i:s'),
            'complaint_notes' => 'Ingin konsultasi herbal.',
        ]);

        $response->assertSessionHasErrors('desired_schedule_at');
        $this->assertDatabaseCount('bookings', 0);
    }

    public function test_customer_can_create_booking_with_profile_data(): void
    {
        [$user, $profile] = $this->createCustomer();
        $service = $this->createService(visitType: 'home_visit');
        $schedule = now()->addDay()->format('Y-m-d H:i:s');

        $response = $this->actingAs($user)->post(route('bookings.store'), [
            'service_id' => $service->id,
            'visit_type' => 'home_visit',
            'desired_schedule_at' => $schedule,
            'complaint_notes' => 'Ingin konsultasi herbal.',
        ]);

        $booking = Booking::query()->firstOrFail();

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('bookings.show', $booking));
        $this->assertNotNull($booking->booking_number);
        $this->assertDatabaseHas('bookings', [
            'user_id' => $user->id,
            'customer_profile_id' => $profile->id,
            'service_id' => $service->id,
            'name' => $profile->name,
            'whatsapp_number' => $profile->whatsapp_number,
            'visit_type' => 'home_visit',
            'complaint_notes' => 'Ingin konsultasi herbal.',
            'status' => 'waiting_confirmation',
        ]);
    }

    public function test_customer_can_view_own_booking_placeholder(): void
    {
        [$user] = $this->createCustomer();
        $booking = $this->createBookingFor($user);

        $response = $this
            ->actingAs($user)
            ->withHeader('X-Inertia', 'true')
            ->get(route('bookings.show', $booking));

        $response->assertOk();
    }

    public function test_customer_cannot_view_another_customers_booking(): void
    {
        [$owner] = $this->createCustomer();
        [$otherUser] = $this->createCustomer(email: 'other@example.com');
        $booking = $this->createBookingFor($owner);

        $response = $this->actingAs($otherUser)->get(route('bookings.show', $booking));

        $response->assertNotFound();
    }

    private function createService(string $visitType = 'home_visit', bool $isActive = true): Service
    {
        return Service::query()->create([
            'name' => 'Konsultasi Herbal '.Service::query()->count(),
            'slug' => 'konsultasi-herbal-'.Service::query()->count(),
            'description' => 'Layanan konsultasi herbal.',
            'price' => 150000,
            'visit_type' => $visitType,
            'is_active' => $isActive,
            'is_featured' => false,
        ]);
    }

    private function createCustomer(string $email = 'customer@example.com'): array
    {
        $user = User::factory()->create(['email' => $email]);
        $profile = CustomerProfile::query()->create([
            'user_id' => $user->id,
            'name' => 'Phoenix Customer',
            'whatsapp_number' => '08123456789',
            'primary_address' => 'Jl. Herbal No. 1',
            'member_status' => 'non_member',
        ]);

        return [$user, $profile];
    }

    private function createBookingFor(User $user): Booking
    {
        $profile = CustomerProfile::query()->where('user_id', $user->id)->firstOrFail();
        $service = $this->createService();

        return Booking::query()->create([
            'booking_number' => 'BK-TEST-'.Booking::query()->count(),
            'user_id' => $user->id,
            'customer_profile_id' => $profile->id,
            'service_id' => $service->id,
            'name' => $profile->name,
            'whatsapp_number' => $profile->whatsapp_number,
            'visit_type' => 'home_visit',
            'desired_schedule_at' => now()->addDay(),
            'complaint_notes' => 'Ingin konsultasi herbal.',
            'status' => 'waiting_confirmation',
        ]);
    }
}
