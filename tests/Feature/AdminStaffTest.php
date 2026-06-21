<?php

namespace Tests\Feature;

use App\Models\Position;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminStaffTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_position_dropdown_only_shows_hierarchy_positions(): void
    {
        $admin = $this->createAdmin();
        $this->createHierarchyPositions();
        Position::query()->create(['name' => 'Supervisor']);

        $this->inertiaGet($admin, route('admin.staff.index'))
            ->assertOk()
            ->assertJsonPath('component', 'Admin/Staff/Index')
            ->assertJsonCount(4, 'props.positions')
            ->assertJsonMissing(['name' => 'Supervisor']);
    }

    public function test_active_admin_can_create_staff_with_hierarchy_position(): void
    {
        $admin = $this->createAdmin();
        $position = Position::query()->firstOrCreate(['name' => 'Executive Premier']);

        $this->actingAs($admin)->post(route('admin.staff.store'), [
            'name' => 'Staff Phoenix',
            'email' => 'staff@example.test',
            'phone_number' => '08123456789',
            'position_id' => $position->id,
            'password' => 'password123',
        ])->assertRedirect(route('admin.staff.index'));

        $this->assertDatabaseHas('users', [
            'name' => 'Staff Phoenix',
            'email' => 'staff@example.test',
            'role' => 'field_staff',
            'position_id' => $position->id,
        ]);
    }

    public function test_active_admin_cannot_create_staff_with_non_hierarchy_position(): void
    {
        $admin = $this->createAdmin();
        $position = Position::query()->create(['name' => 'Supervisor']);

        $this->actingAs($admin)->post(route('admin.staff.store'), [
            'name' => 'Staff Phoenix',
            'email' => 'staff@example.test',
            'position_id' => $position->id,
            'password' => 'password123',
        ])->assertSessionHasErrors('position_id');

        $this->assertDatabaseMissing('users', [
            'email' => 'staff@example.test',
            'role' => 'field_staff',
        ]);
    }

    public function test_active_admin_cannot_update_staff_to_non_hierarchy_position(): void
    {
        $admin = $this->createAdmin();
        $staff = User::factory()->create([
            'role' => 'field_staff',
            'is_active' => true,
            'email' => 'staff@example.test',
        ]);
        $position = Position::query()->create(['name' => 'Supervisor']);

        $this->actingAs($admin)->post(route('admin.staff.update', $staff), [
            '_method' => 'put',
            'name' => $staff->name,
            'email' => $staff->email,
            'position_id' => $position->id,
        ])->assertSessionHasErrors('position_id');

        $this->assertDatabaseMissing('users', [
            'id' => $staff->id,
            'position_id' => $position->id,
        ]);
    }

    private function createAdmin(): User
    {
        return User::factory()->create(['role' => 'admin', 'is_active' => true]);
    }

    private function createHierarchyPositions(): void
    {
        foreach (['Executive Premier', 'Executive Leader', 'Junior Leader', 'Business Crew'] as $name) {
            Position::query()->firstOrCreate(['name' => $name]);
        }
    }

    private function inertiaGet(User $admin, string $url): \Illuminate\Testing\TestResponse
    {
        $request = $this->actingAs($admin)->withHeader('X-Inertia', 'true');

        if (file_exists(public_path('build/manifest.json'))) {
            $request->withHeader('X-Inertia-Version', hash_file('xxh128', public_path('build/manifest.json')));
        }

        return $request->get($url);
    }
}
