<?php

namespace Tests\Feature;

use App\Models\CustomerProfile;
use App\Models\PaymentMethod;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_database_seeder_creates_customer_accounts_and_payment_methods(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertDatabaseHas('users', [
            'email' => 'customer@phoenix.test',
            'role' => 'customer',
            'is_active' => true,
        ]);
        $this->assertDatabaseHas('users', [
            'email' => 'customer.nonmember@phoenix.test',
            'role' => 'customer',
            'is_active' => true,
        ]);

        $member = User::query()->where('email', 'customer@phoenix.test')->firstOrFail();
        $nonMember = User::query()->where('email', 'customer.nonmember@phoenix.test')->firstOrFail();

        $this->assertDatabaseHas('customer_profiles', [
            'user_id' => $member->id,
            'whatsapp_number' => '081234567890',
            'member_status' => 'member',
        ]);
        $this->assertDatabaseHas('customer_profiles', [
            'user_id' => $nonMember->id,
            'whatsapp_number' => '081111222333',
            'member_status' => 'non_member',
        ]);

        $this->assertDatabaseHas('payment_methods', [
            'type' => 'bank_transfer',
            'bank_name' => 'BCA',
            'account_number' => '1234567890',
            'account_holder_name' => 'PT Phoenix Herbal Indonesia',
            'is_active' => true,
        ]);
        $this->assertDatabaseHas('payment_methods', [
            'type' => 'qris',
            'qris_image_path' => 'payment-methods/qris-phoenix-dummy.png',
            'is_active' => true,
        ]);

        $this->assertSame(2, CustomerProfile::query()->whereIn('member_status', ['member', 'non_member'])->count());
        $this->assertSame(2, PaymentMethod::query()->where('is_active', true)->count());
    }

    public function test_database_seeder_is_idempotent_for_requested_records(): void
    {
        $this->seed(DatabaseSeeder::class);
        $this->seed(DatabaseSeeder::class);

        $this->assertSame(1, User::query()->where('email', 'customer@phoenix.test')->count());
        $this->assertSame(1, User::query()->where('email', 'customer.nonmember@phoenix.test')->count());
        $this->assertSame(1, PaymentMethod::query()->where('type', 'bank_transfer')->where('bank_name', 'BCA')->where('account_number', '1234567890')->count());
        $this->assertSame(1, PaymentMethod::query()->where('type', 'qris')->where('qris_image_path', 'payment-methods/qris-phoenix-dummy.png')->count());
    }
}
