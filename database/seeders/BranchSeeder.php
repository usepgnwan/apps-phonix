<?php

namespace Database\Seeders;

use App\Models\Branch;
use Illuminate\Database\Seeder;

class BranchSeeder extends Seeder
{
    /**
     * Seed master cabang. Assignment user → cabang dilakukan di DatabaseSeeder.
     */
    public function run(): void
    {
        Branch::query()->updateOrCreate(
            ['slug' => 'pusat'],
            [
                'name' => 'Pusat',
                'code' => 'PST',
                'address' => 'Jl. Pusat Operasional No. 1, Jakarta',
                'phone_number' => '021-12345678',
                'description' => 'Kantor Pusat Phoenix Herbal',
                'is_active' => true,
            ]
        );

        Branch::query()->updateOrCreate(
            ['slug' => 'cabang-bandung'],
            [
                'name' => 'Cabang Bandung',
                'code' => 'BDG',
                'address' => 'Jl. Cihampelas No. 123, Bandung',
                'phone_number' => '022-87654321',
                'description' => 'Cabang Operasional Bandung',
                'is_active' => true,
            ]
        );
    }
}
