<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\StaffReferralClick;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminStaffReferralTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_staff_referrals_index(): void
    {
        $this->get(route('admin.staff-referrals.index'))
            ->assertRedirect(route('login'));
    }

    public function test_non_admin_gets_forbidden(): void
    {
        $customer = User::factory()->customer()->create();

        $this->actingAs($customer)
            ->get(route('admin.staff-referrals.index'))
            ->assertForbidden();
    }

    public function test_admin_pusat_sees_all_branches_staff(): void
    {
        $admin = User::factory()->adminCentral()->create();
        $branchA = $this->createBranch('Cabang A', 'A1');
        $branchB = $this->createBranch('Cabang B', 'B1');

        $staffA = User::factory()->fieldStaff($branchA->id)->create([
            'name' => 'Staff A',
            'staff_code' => 'STF-AAAA',
        ]);
        $staffB = User::factory()->fieldStaff($branchB->id)->create([
            'name' => 'Staff B',
            'staff_code' => 'STF-BBBB',
        ]);

        User::factory()->customer()->create([
            'referred_by_staff_id' => $staffA->id,
            'referred_at' => now(),
        ]);
        StaffReferralClick::query()->create([
            'staff_user_id' => $staffB->id,
            'clicked_at' => now(),
            'expires_at' => now()->addDays(30),
        ]);

        $response = $this->inertiaGet($admin, route('admin.staff-referrals.index'));

        $response->assertOk()
            ->assertJsonPath('component', 'Admin/StaffReferrals/Index')
            ->assertJsonPath('props.showBranchFilter', true)
            ->assertJsonPath('props.metrics.staff_with_code', 2)
            ->assertJsonPath('props.metrics.total_registrations', 1)
            ->assertJsonPath('props.metrics.total_clicks', 1);

        $names = collect($response->json('props.staff.data'))->pluck('name')->all();
        $this->assertContains('Staff A', $names);
        $this->assertContains('Staff B', $names);
    }

    public function test_admin_cabang_only_sees_own_branch_staff(): void
    {
        $branchA = $this->createBranch('Cabang A', 'A2');
        $branchB = $this->createBranch('Cabang B', 'B2');
        $adminCabang = User::factory()->adminBranch($branchA->id)->create();

        $staffA = User::factory()->fieldStaff($branchA->id)->create([
            'name' => 'Staff Cabang A',
            'staff_code' => 'STF-CAAA',
        ]);
        User::factory()->fieldStaff($branchB->id)->create([
            'name' => 'Staff Cabang B',
            'staff_code' => 'STF-CBBB',
        ]);

        User::factory()->customer()->create([
            'referred_by_staff_id' => $staffA->id,
            'referred_at' => now(),
        ]);

        $response = $this->inertiaGet($adminCabang, route('admin.staff-referrals.index'));

        $response->assertOk()
            ->assertJsonPath('component', 'Admin/StaffReferrals/Index')
            ->assertJsonPath('props.showBranchFilter', false)
            ->assertJsonPath('props.metrics.staff_with_code', 1)
            ->assertJsonPath('props.metrics.total_registrations', 1)
            ->assertJsonPath('props.staff.data.0.name', 'Staff Cabang A');

        $names = collect($response->json('props.staff.data'))->pluck('name')->all();
        $this->assertNotContains('Staff Cabang B', $names);
    }

    public function test_admin_pusat_can_filter_by_branch(): void
    {
        $admin = User::factory()->adminCentral()->create();
        $branchA = $this->createBranch('Cabang Filter A', 'FA');
        $branchB = $this->createBranch('Cabang Filter B', 'FB');

        User::factory()->fieldStaff($branchA->id)->create([
            'name' => 'Only A',
            'staff_code' => 'STF-FILA',
        ]);
        User::factory()->fieldStaff($branchB->id)->create([
            'name' => 'Only B',
            'staff_code' => 'STF-FILB',
        ]);

        $response = $this->inertiaGet(
            $admin,
            route('admin.staff-referrals.index', ['branch_id' => $branchA->id])
        );

        $response->assertOk()
            ->assertJsonPath('props.filters.branch_id', $branchA->id)
            ->assertJsonPath('props.staff.data.0.name', 'Only A');

        $names = collect($response->json('props.staff.data'))->pluck('name')->all();
        $this->assertNotContains('Only B', $names);
    }

    public function test_admin_pusat_can_view_staff_detail(): void
    {
        $admin = User::factory()->adminCentral()->create();
        $branch = $this->createBranch('Cabang Detail', 'DET');
        $staff = User::factory()->fieldStaff($branch->id)->create([
            'name' => 'Staff Detail',
            'staff_code' => 'STF-DETL',
        ]);

        User::factory()->customer()->create([
            'name' => 'Customer Referred',
            'referred_by_staff_id' => $staff->id,
            'referred_at' => now(),
        ]);

        $this->inertiaGet($admin, route('admin.staff-referrals.show', $staff))
            ->assertOk()
            ->assertJsonPath('component', 'Admin/StaffReferrals/Show')
            ->assertJsonPath('props.staff.id', $staff->id)
            ->assertJsonPath('props.staff.staff_code', 'STF-DETL')
            ->assertJsonPath('props.metrics.registration_count', 1);
    }

    public function test_admin_cabang_cannot_view_other_branch_staff_detail(): void
    {
        $branchA = $this->createBranch('Cabang Own', 'OWN');
        $branchB = $this->createBranch('Cabang Other', 'OTH');
        $adminCabang = User::factory()->adminBranch($branchA->id)->create();
        $staffOther = User::factory()->fieldStaff($branchB->id)->create([
            'staff_code' => 'STF-OTHX',
        ]);

        $this->actingAs($adminCabang)
            ->get(route('admin.staff-referrals.show', $staffOther))
            ->assertForbidden();
    }

    private function createBranch(string $name, string $code): Branch
    {
        return Branch::query()->create([
            'name' => $name,
            'slug' => strtolower(str_replace(' ', '-', $name)).'-'.Branch::query()->count(),
            'code' => $code.Branch::query()->count(),
            'is_active' => true,
        ]);
    }

    private function inertiaGet(User $user, string $url): \Illuminate\Testing\TestResponse
    {
        $request = $this->actingAs($user)->withHeader('X-Inertia', 'true');

        if (file_exists(public_path('build/manifest.json'))) {
            $request->withHeader('X-Inertia-Version', hash_file('xxh128', public_path('build/manifest.json')));
        }

        return $request->get($url);
    }
}
