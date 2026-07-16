<?php

namespace App\Console\Commands;

use App\Services\Affiliate\AffiliateCommissionService;
use Illuminate\Console\Command;

class ApproveHeldAffiliateCommissions extends Command
{
    protected $signature = 'affiliate:approve-held-commissions';

    protected $description = 'Ubah komisi affiliate berstatus hold yang sudah melewati masa garansi menjadi approved';

    public function handle(AffiliateCommissionService $commissionService): int
    {
        $count = $commissionService->approveHeldCommissions();
        $this->info("Komisi disetujui: {$count}");

        return self::SUCCESS;
    }
}
