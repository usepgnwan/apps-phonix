<?php

namespace App\Http\Requests\Admin;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreOfflineSaleRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null && $user->role === 'admin' && $user->is_active;
    }

    public function rules(): array
    {
        return [
            'customer_profile_id' => ['nullable', 'exists:customer_profiles,id'],
            'lead_id' => ['nullable', 'exists:leads,id'],
            'field_staff_id' => [
                'nullable',
                Rule::exists('users', 'id')->where('role', 'field_staff')->where('is_active', true),
            ],
            'event_id' => ['nullable', 'exists:events,id'],
            'source' => ['required', Rule::in(['offline', 'door_to_door', 'event'])],
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_whatsapp_number' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'sold_at' => ['required', 'date'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => [
                'required',
                Rule::exists('products', 'id')->where('is_active', true),
            ],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $items = $this->input('items', []);

                if (! is_array($items)) {
                    return;
                }

                foreach ($items as $index => $item) {
                    if (! is_array($item) || ! isset($item['product_id'], $item['quantity']) || ! is_numeric($item['quantity'])) {
                        continue;
                    }

                    $product = Product::query()
                        ->whereKey($item['product_id'])
                        ->where('is_active', true)
                        ->first();

                    if ($product === null) {
                        continue;
                    }

                    if ((int) $item['quantity'] > $product->stock_quantity) {
                        $validator->errors()->add("items.{$index}.quantity", "Stok {$product->name} tidak mencukupi.");
                    }
                }
            },
        ];
    }
}
