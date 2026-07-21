<?php

namespace App\Http\Requests\Admin;

use App\Models\MarketingKit;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreMarketingKitRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null && $user->isAdmin();
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', Rule::in(MarketingKit::CATEGORIES)],
            'description' => ['nullable', 'string', 'max:2000'],
            'body_text' => ['nullable', 'string', 'max:10000'],
            'file' => ['nullable', 'file', 'max:51200'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.max' => 'Ukuran file maksimal 50MB.',
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $category = $this->input('category');
                $hasFile = $this->hasFile('file');
                $bodyText = trim((string) $this->input('body_text', ''));

                if ($category === MarketingKit::CATEGORY_TEXT && $bodyText === '') {
                    $validator->errors()->add('body_text', 'Naskah copywriting wajib diisi untuk kategori teks.');
                }

                if (in_array($category, [MarketingKit::CATEGORY_IMAGE, MarketingKit::CATEGORY_VIDEO, MarketingKit::CATEGORY_PDF], true) && ! $hasFile) {
                    $validator->errors()->add('file', 'File wajib diunggah untuk kategori ini.');
                }

                if (! $hasFile) {
                    return;
                }

                $mime = (string) $this->file('file')->getMimeType();
                $extension = strtolower((string) $this->file('file')->getClientOriginalExtension());

                $valid = match ($category) {
                    MarketingKit::CATEGORY_IMAGE => str_starts_with($mime, 'image/') || in_array($extension, ['jpg', 'jpeg', 'png', 'webp', 'gif'], true),
                    MarketingKit::CATEGORY_VIDEO => str_starts_with($mime, 'video/') || in_array($extension, ['mp4', 'webm', 'mov'], true),
                    MarketingKit::CATEGORY_PDF => $mime === 'application/pdf' || $extension === 'pdf',
                    MarketingKit::CATEGORY_TEXT => true,
                    default => false,
                };

                if (! $valid) {
                    $validator->errors()->add('file', 'Tipe file tidak sesuai dengan kategori materi.');
                }
            },
        ];
    }
}
