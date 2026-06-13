<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use App\Services\CartResolver;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    public function __construct(private readonly CartResolver $cartResolver)
    {
    }

    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'cartSummary' => fn (): array => [
                'count' => (int) ($this->cartResolver->existing($request)?->cartItems()->sum('quantity') ?? 0),
            ],
            'siteSettings' => fn (): array => [
                'whatsappNumber' => Setting::query()->where('key', 'whatsapp_number')->value('value') ?: '6281234567890',
                'alamat' => Setting::query()->where('key', 'alamat')->value('value') ?: '',
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'whatsappUrl' => fn () => $request->session()->get('whatsapp_url'),
            ],
        ];
    }
}
