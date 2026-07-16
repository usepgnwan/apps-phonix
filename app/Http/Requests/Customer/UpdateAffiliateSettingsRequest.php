<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAffiliateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null && $user->isCustomer() && $user->isAffiliateActive();
    }

    public function rules(): array
    {
        $selectedPlatforms = collect($this->input('platforms', []))
            ->filter(fn ($platform) => is_string($platform))
            ->values()
            ->all();

        $platformLinkRules = [
            'platform_links' => ['required', 'array'],
        ];

        $allowedPlatforms = ['whatsapp', 'instagram', 'facebook', 'tiktok', 'youtube'];

        foreach ($allowedPlatforms as $platform) {
            $platformLinkRules["platform_links.{$platform}"] = in_array($platform, $selectedPlatforms, true)
                ? ['required', 'string', 'max:500']
                : ['nullable', 'string', 'max:500'];
        }

        return [
            'whatsapp' => ['required', 'string', 'max:30'],
            'city' => ['required', 'string', 'max:120'],
            'platforms' => ['required', 'array', 'min:1'],
            'platforms.*' => ['string', Rule::in($allowedPlatforms)],
            ...$platformLinkRules,
            'payout_method' => ['required', 'string', Rule::in(['BCA', 'Mandiri', 'BRI', 'BNI', 'DANA', 'OVO', 'GOPAY'])],
            'payout_account_number' => ['required', 'string', 'max:50'],
            'payout_account_name' => ['required', 'string', 'max:255'],
        ];
    }

    /**
     * @return array{whatsapp: string, city: string, platforms: array<string, string>, media_url: string|null, payout_method: string, payout_account_number: string, payout_account_name: string}
     */
    public function settingsPayload(): array
    {
        $validated = $this->validated();
        $selected = collect($validated['platforms'] ?? []);
        $links = collect($validated['platform_links'] ?? []);

        $platformMap = $selected
            ->mapWithKeys(function (string $platform) use ($links) {
                $url = trim((string) $links->get($platform, ''));

                return $url !== '' ? [$platform => $url] : [];
            })
            ->all();

        $primaryUrl = collect($platformMap)->first();

        return [
            'whatsapp' => $validated['whatsapp'],
            'city' => $validated['city'],
            'platforms' => $platformMap,
            'media_url' => is_string($primaryUrl) ? mb_substr($primaryUrl, 0, 255) : null,
            'payout_method' => $validated['payout_method'],
            'payout_account_number' => $validated['payout_account_number'],
            'payout_account_name' => $validated['payout_account_name'],
        ];
    }
}
