<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null && $user->isAdmin();
    }

    public function rules(): array
    {
        $product = $this->route('product');

        return [
            'product_category_id' => ['required', 'integer', 'exists:product_categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:products,slug,'.$product->id],
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
            'is_active' => ['required', 'boolean'],
            'is_featured' => ['required', 'boolean'],

            // New Branch specific stocks
            'branch_stocks' => ['nullable', 'array'],
            'branch_stocks.*.stock_quantity' => ['nullable', 'integer', 'min:0'],
            'branch_stocks.*.low_stock_threshold' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
