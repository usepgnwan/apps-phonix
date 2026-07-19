<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Services\StaffReferral\StaffReferralAttributionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class StaffReferralTrackController extends Controller
{
    public function __invoke(
        string $staffCode,
        Request $request,
        StaffReferralAttributionService $attributionService
    ): RedirectResponse {
        $staff = $attributionService->resolveActiveByStaffCode($staffCode);

        if ($staff !== null) {
            $attributionService->trackClick($staff, $request);
        }

        $redirectTo = $attributionService->safeRedirectPath(
            $request->query('redirect'),
            route('register', absolute: false)
        );

        return redirect()->to($redirectTo);
    }
}
