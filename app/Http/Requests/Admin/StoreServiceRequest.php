<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null && $user->role === 'admin' && $user->is_active;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:services,slug'],
            'description' => ['required', 'string'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'visit_type' => ['required', 'in:home_visit,office_visit,both'],
            'image_path' => ['nullable', 'string', 'max:255'],
            'thumbnail' => ['nullable', 'image', 'max:4096'],
            'is_active' => ['required', 'boolean'],
            'is_featured' => ['required', 'boolean'],
        ];
    }
}
