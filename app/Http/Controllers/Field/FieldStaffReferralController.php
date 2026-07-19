<?php

namespace App\Http\Controllers\Field;

use App\Http\Controllers\Controller;
use App\Models\StaffReferralClick;
use App\Models\User;
use App\Services\StaffReferral\StaffCodeGenerator;
use App\Services\StaffReferral\StaffReferralAttributionService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FieldStaffReferralController extends Controller
{
    public function show(
        Request $request,
        StaffReferralAttributionService $attributionService,
        StaffCodeGenerator $codeGenerator
    ): Response {
        $user = $this->ensureActiveFieldStaff($request);

        if ($user->staff_code === null || $user->staff_code === '') {
            $user->forceFill([
                'staff_code' => $codeGenerator->generate(),
                'staff_referral_enabled' => $user->staff_referral_enabled ?? true,
            ])->save();
        }

        $clickCount = StaffReferralClick::query()
            ->where('staff_user_id', $user->id)
            ->count();

        $registrationCount = User::query()
            ->where('referred_by_staff_id', $user->id)
            ->count();

        $recentRegistrations = User::query()
            ->where('referred_by_staff_id', $user->id)
            ->latest('referred_at')
            ->limit(10)
            ->get(['id', 'name', 'email', 'referred_at', 'created_at']);

        return Inertia::render('Field/Referral/Show', [
            'staffCode' => $user->staff_code,
            'trackingUrl' => $attributionService->trackingUrl($user),
            'referralEnabled' => (bool) $user->staff_referral_enabled,
            'metrics' => [
                'click_count' => $clickCount,
                'registration_count' => $registrationCount,
            ],
            'recentRegistrations' => $recentRegistrations,
        ]);
    }

    private function ensureActiveFieldStaff(Request $request): User
    {
        $user = $request->user();

        abort_unless($user?->role === 'field_staff' && $user->is_active === true, 403);

        return $user;
    }
}
