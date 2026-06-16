<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null && $user->role === 'admin' && $user->is_active;
    }

    public function rules(): array
    {
        return [
            'product_category_id' => ['required', 'integer', 'exists:product_categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:products,slug'],
            'bpom_number' => ['nullable', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'short_description' => ['required', 'string'],
            'full_description' => ['required', 'string'],
            'composition' => ['nullable', 'string'],
            'packaging_type' => ['nullable', 'string', 'max:255'],
            'content_amount' => ['nullable', 'numeric', 'min:0'],
            'content_unit' => ['nullable', 'string', 'max:50'],
            'benefits' => ['nullable', 'string'],
            'usage_rules' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'image_path' => ['nullable', 'string', 'max:255'],
            'thumbnail' => ['nullable', 'image', 'max:4096'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'low_stock_threshold' => ['required', 'integer', 'min:0'],
            'is_active' => ['required', 'boolean'],
            'is_featured' => ['required', 'boolean'],
        ];
    }
}
