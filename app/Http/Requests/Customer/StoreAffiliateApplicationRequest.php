<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAffiliateApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null && $user->isCustomer();
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
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'whatsapp' => ['required', 'string', 'max:30'],
            'city' => ['required', 'string', 'max:120'],
            'age' => ['required', 'integer', 'min:17', 'max:100'],
            'platforms' => ['required', 'array', 'min:1'],
            'platforms.*' => ['string', Rule::in($allowedPlatforms)],
            ...$platformLinkRules,
            // max:2048 = 2MB — selaras upload_max_filesize PHP default environment ini
            'photo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'payout_method' => ['required', 'string', Rule::in(['BCA', 'Mandiri', 'BRI', 'BNI', 'DANA', 'OVO', 'GOPAY'])],
            'payout_account_number' => ['required', 'string', 'max:50'],
            'payout_account_name' => ['required', 'string', 'max:255'],
            'agreement' => ['accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'photo.required' => 'Foto diri wajib diunggah.',
            'photo.image' => 'Berkas harus berupa gambar (JPG, PNG, atau WEBP).',
            'photo.mimes' => 'Format foto harus JPG, JPEG, PNG, atau WEBP.',
            'photo.max' => 'Ukuran foto maksimal 2 MB.',
            'photo.uploaded' => 'Foto gagal diunggah. Pastikan ukuran file maksimal 2 MB dan format JPG/PNG/WEBP.',
        ];
    }

    /**
     * @return array{platforms: array<string, string>, media_url: string|null}
     */
    public function platformPayload(): array
    {
        $selected = collect($this->validated('platforms', []));
        $links = collect($this->validated('platform_links', []));

        $platformMap = $selected
            ->mapWithKeys(function (string $platform) use ($links) {
                $url = trim((string) $links->get($platform, ''));

                return $url !== '' ? [$platform => $url] : [];
            })
            ->all();

        $primaryUrl = collect($platformMap)->first();

        return [
            'platforms' => $platformMap,
            'media_url' => is_string($primaryUrl) ? mb_substr($primaryUrl, 0, 255) : null,
        ];
    }
}
