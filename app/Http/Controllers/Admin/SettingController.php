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
            'whatsapp_number' => ['nullable', 'string', 'max:20'],
            'alamat' => ['nullable', 'string'],
        ]);

        if (array_key_exists('whatsapp_number', $data)) {
            $data['whatsapp_number'] = $this->normalizeWhatsappNumber($data['whatsapp_number']);
        }

        foreach ($data as $key => $value) {
            Setting::query()->updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        return redirect()->back()->with('success', 'Pengaturan berhasil diperbarui.');
    }

    /**
     * Normalisasi nomor WhatsApp ke format wa.me (digit only, prefix 62).
     * Contoh:
     *  - "08123456789"   -> "628123456789"
     *  - "+628123456789" -> "628123456789"
     *  - "8123456789"    -> "628123456789"
     *  - ""              -> null
     */
    private function normalizeWhatsappNumber(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $digits = preg_replace('/\D+/', '', $value);

        if ($digits === null || $digits === '') {
            return null;
        }

        if (str_starts_with($digits, '0')) {
            $digits = '62' . ltrim($digits, '0');
        } elseif (! str_starts_with($digits, '62')) {
            $digits = '62' . $digits;
        }

        return $digits;
    }
}
