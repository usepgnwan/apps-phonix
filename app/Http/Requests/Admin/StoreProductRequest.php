<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null && $user->isAdmin();
    }

    public function rules(): array
    {
        return [
            'product_category_id' => ['required', 'exists:product_categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:products,slug'],
            'bpom_number' => ['nullable', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'full_description' => ['nullable', 'string'],
            'composition' => ['nullable', 'string'],
            'packaging_type' => ['nullable', 'string', 'max:255'],
            'content_amount' => ['nullable', 'numeric', 'min:0'],
            'content_unit' => ['nullable', 'string', 'max:50'],
            'benefits' => ['nullable', 'string'],
            'usage_rules' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
            'thumbnail' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            
            // Validasi untuk stok cabang
            'branch_stocks' => ['nullable', 'array'],
            'branch_stocks.*.stock_quantity' => ['nullable', 'integer', 'min:0'],
            'branch_stocks.*.low_stock_threshold' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
