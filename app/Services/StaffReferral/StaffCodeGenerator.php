<?php

namespace App\Services\StaffReferral;

use App\Models\User;

class StaffCodeGenerator
{
    private const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    public function generate(): string
    {
        do {
            $suffix = '';
            for ($i = 0; $i < 4; $i++) {
                $suffix .= self::ALPHABET[random_int(0, strlen(self::ALPHABET) - 1)];
            }
            $code = 'STF-'.$suffix;
        } while (User::query()->where('staff_code', $code)->exists());

        return $code;
    }
}
