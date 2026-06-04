<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\UpsertCustomerProfileRequest;
use App\Models\CustomerProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerProfileController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        $customerProfile = $this->resolveCustomerProfile($request);

        if ($customerProfile === null) {
            return redirect()->route('customer.profile.create');
        }

        return Inertia::render('Welcome', [
            'page' => 'customer.profile.show',
            'customerProfile' => $customerProfile,
        ]);
    }

    public function create(Request $request): Response|RedirectResponse
    {
        if ($this->resolveCustomerProfile($request) !== null) {
            return redirect()->route('customer.profile.edit');
        }

        return Inertia::render('Welcome', [
            'page' => 'customer.profile.create',
        ]);
    }

    public function store(UpsertCustomerProfileRequest $request): RedirectResponse
    {
        if ($this->resolveCustomerProfile($request) !== null) {
            return redirect()->route('customer.profile.edit');
        }

        CustomerProfile::query()->create([
            'user_id' => $request->user()->id,
            'member_status' => 'non_member',
            'internal_notes' => null,
            ...$request->validated(),
        ]);

        return redirect()
            ->route('customer.dashboard.index')
            ->with('success', 'Profil customer berhasil disimpan.');
    }

    public function edit(Request $request): Response|RedirectResponse
    {
        $customerProfile = $this->resolveCustomerProfile($request);

        if ($customerProfile === null) {
            return redirect()->route('customer.profile.create');
        }

        return Inertia::render('Welcome', [
            'page' => 'customer.profile.edit',
            'customerProfile' => $customerProfile,
        ]);
    }

    public function update(UpsertCustomerProfileRequest $request): RedirectResponse
    {
        $customerProfile = $this->resolveCustomerProfile($request);

        if ($customerProfile === null) {
            return redirect()->route('customer.profile.create');
        }

        $customerProfile->fill($request->validated());
        $customerProfile->save();

        return redirect()
            ->route('customer.profile.show')
            ->with('success', 'Profil customer berhasil diperbarui.');
    }

    private function resolveCustomerProfile(Request $request): ?CustomerProfile
    {
        return CustomerProfile::query()
            ->where('user_id', $request->user()->id)
            ->first();
    }
}
