<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreAffiliateApplicationRequest;
use App\Models\Affiliate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AffiliateApplicationController extends Controller
{
    public function create(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        abort_unless($user !== null && $user->isCustomer(), 403);

        $affiliate = $user->affiliate;

        if ($affiliate?->status === Affiliate::STATUS_ACTIVE) {
            return redirect()->route('customer.affiliate.dashboard');
        }

        if ($affiliate?->status === Affiliate::STATUS_PENDING) {
            return redirect()
                ->route('affiliate.landing')
                ->with('success', 'Pendaftaran affiliate Anda sedang menunggu review admin.');
        }

        $profile = $user->customerProfile;

        return Inertia::render('Customer/Affiliate/Apply', [
            'defaults' => [
                'full_name' => $profile?->name ?? $user->name,
                'email' => $user->email,
                'whatsapp' => $profile?->whatsapp_number ?? $user->phone_number ?? '',
                'city' => '',
                'age' => '',
            ],
        ]);
    }

    public function store(StoreAffiliateApplicationRequest $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user !== null && $user->isCustomer(), 403);

        $existing = $user->affiliate;

        if ($existing !== null && in_array($existing->status, [Affiliate::STATUS_PENDING, Affiliate::STATUS_ACTIVE], true)) {
            return redirect()
                ->route('affiliate.landing')
                ->with('success', 'Anda sudah memiliki pengajuan atau akun affiliate.');
        }

        $validated = $request->validated();
        $photoPath = $request->file('photo')->store('affiliates/photos', 'public');

        $platformPayload = $request->platformPayload();

        $payload = [
            'user_id' => $user->id,
            'status' => Affiliate::STATUS_PENDING,
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'whatsapp' => $validated['whatsapp'],
            'city' => $validated['city'],
            'age' => $validated['age'],
            'platforms' => $platformPayload['platforms'],
            'media_url' => $platformPayload['media_url'],
            'photo_path' => $photoPath,
            'payout_method' => $validated['payout_method'],
            'payout_account_number' => $validated['payout_account_number'],
            'payout_account_name' => $validated['payout_account_name'],
            'submitted_at' => now(),
            'rejection_reason' => null,
            'rejected_at' => null,
            'rejected_by' => null,
        ];

        if ($existing !== null && $existing->status === Affiliate::STATUS_REJECTED) {
            $existing->update($payload);
        } else {
            Affiliate::query()->create($payload);
        }

        return redirect()
            ->route('affiliate.landing')
            ->with('success', 'Formulir pendaftaran affiliate berhasil dikirim. Tim admin akan meninjau pengajuan Anda.');
    }
}
