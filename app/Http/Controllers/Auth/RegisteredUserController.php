<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\StaffReferral\StaffReferralAttributionService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(Request $request, StaffReferralAttributionService $attributionService): Response
    {
        $referringStaff = $attributionService->resolveFromRequest($request);

        return Inertia::render('Auth/Register', [
            'referringStaff' => $referringStaff === null
                ? null
                : [
                    'name' => $referringStaff->name,
                    'staff_code' => $referringStaff->staff_code,
                ],
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request, StaffReferralAttributionService $attributionService): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'whatsapp_number' => ['required', 'string', 'max:30'],
            'primary_address' => ['required', 'string', 'max:1000'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'staff_ref' => ['nullable', 'string', 'max:32'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'customer',
            'is_active' => true,
        ]);

        $referringStaff = $attributionService->bindOnRegister($user, $request);

        $internalNotes = $referringStaff === null
            ? 'Customer mendaftar mandiri melalui halaman registrasi.'
            : 'Customer mendaftar melalui referral staff '.$referringStaff->name.' ('.$referringStaff->staff_code.').';

        $user->customerProfile()->create([
            'name' => $request->name,
            'whatsapp_number' => $request->whatsapp_number,
            'primary_address' => $request->primary_address,
            'member_status' => 'non_member',
            'internal_notes' => $internalNotes,
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
