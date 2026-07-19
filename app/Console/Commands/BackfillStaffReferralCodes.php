<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\StaffReferral\StaffCodeGenerator;
use Illuminate\Console\Command;

class BackfillStaffReferralCodes extends Command
{
    protected $signature = 'staff-referral:backfill-codes';

    protected $description = 'Generate staff_code for field_staff users that do not have one yet';

    public function handle(StaffCodeGenerator $codeGenerator): int
    {
        $query = User::query()
            ->where('role', 'field_staff')
            ->where(function ($inner): void {
                $inner->whereNull('staff_code')->orWhere('staff_code', '');
            });

        $count = 0;

        $query->orderBy('id')->chunkById(100, function ($staffMembers) use ($codeGenerator, &$count): void {
            foreach ($staffMembers as $staff) {
                $staff->forceFill([
                    'staff_code' => $codeGenerator->generate(),
                    'staff_referral_enabled' => $staff->staff_referral_enabled ?? true,
                ])->save();
                $count++;
            }
        });

        $this->info("Backfilled staff_code for {$count} field staff user(s).");

        return self::SUCCESS;
    }
}
