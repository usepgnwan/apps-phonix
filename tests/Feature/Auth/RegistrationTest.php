<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'whatsapp_number' => '081234567890',
            'primary_address' => 'Jl. Customer Baru No. 1, CANGGU, KUTA UTARA, KABUPATEN BADUNG, BALI',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));

        $user = User::query()->where('email', 'test@example.com')->firstOrFail();

        $this->assertDatabaseHas('customer_profiles', [
            'user_id' => $user->id,
            'name' => 'Test User',
            'whatsapp_number' => '081234567890',
            'primary_address' => 'Jl. Customer Baru No. 1, CANGGU, KUTA UTARA, KABUPATEN BADUNG, BALI',
            'member_status' => 'non_member',
        ]);
    }

    public function test_registration_requires_whatsapp_number_and_primary_address(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertSessionHasErrors(['whatsapp_number', 'primary_address']);
        $this->assertGuest();
    }
}
