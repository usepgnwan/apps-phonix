<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    private function authorizeAdmin(): void
    {
        $user = request()->user();
        abort_unless($user !== null && $user->role === 'admin' && $user->is_active, 403);
    }

    public function index(): Response
    {
        $this->authorizeAdmin();

        $settings = Setting::query()->pluck('value', 'key')->toArray();

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $this->authorizeAdmin();

        $data = $request->validate([
            'order_template' => ['nullable', 'string'],
            'receipt_email' => ['nullable', 'email'],
        ]);

        foreach ($data as $key => $value) {
            Setting::query()->updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        return redirect()->back()->with('success', 'Pengaturan berhasil diperbarui.');
    }
}
