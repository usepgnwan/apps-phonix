<?php

use App\Models\Position;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    private const POSITIONS = [
        'Executive Premier',
        'Executive Leader',
        'Junior Leader',
        'Business Crew',
    ];

    public function up(): void
    {
        foreach (self::POSITIONS as $position) {
            Position::query()->firstOrCreate(['name' => $position]);
        }
    }

    public function down(): void
    {
        Position::query()
            ->whereIn('name', self::POSITIONS)
            ->whereDoesntHave('users')
            ->delete();
    }
};
