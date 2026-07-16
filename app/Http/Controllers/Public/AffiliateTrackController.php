<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Services\Affiliate\AffiliateAttributionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AffiliateTrackController extends Controller
{
    public function __invoke(string $partnerCode, Request $request, AffiliateAttributionService $attributionService): RedirectResponse
    {
        $affiliate = $attributionService->resolveActiveByPartnerCode($partnerCode);

        if ($affiliate !== null) {
            $attributionService->trackClick($affiliate, $request);
        }

        $redirectTo = $request->query('redirect', route('home'));

        return redirect()->to($redirectTo);
    }
}
