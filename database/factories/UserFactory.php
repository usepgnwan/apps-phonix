<?php

namespace Database\Factories;

use App\Models\Branch;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'role' => 'customer',
            'is_active' => true,
            'admin_scope' => null,
            'branch_id' => null,
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function adminCentral(?int $branchId = null): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'admin',
            'admin_scope' => 'central',
            'is_active' => true,
            'branch_id' => $branchId,
        ]);
    }

    public function adminBranch(?int $branchId = null): static
    {
        return $this->state(function (array $attributes) use ($branchId) {
            return [
                'role' => 'admin',
                'admin_scope' => 'branch',
                'is_active' => true,
                'branch_id' => $branchId ?? Branch::query()->value('id'),
            ];
        });
    }

    public function fieldStaff(?int $branchId = null): static
    {
        return $this->state(function (array $attributes) use ($branchId) {
            return [
                'role' => 'field_staff',
                'admin_scope' => null,
                'is_active' => true,
                'branch_id' => $branchId ?? Branch::query()->value('id'),
            ];
        });
    }

    public function customer(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'customer',
            'admin_scope' => null,
            'branch_id' => null,
            'is_active' => true,
        ]);
    }
}
