<?php

namespace App\Http\Requests\Admin;

use App\Models\BranchProductStock;
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

    protected function prepareForValidation(): void
    {
        $user = $this->user();
        $forcedBranchId = $user?->forcedBranchId();

        if ($forcedBranchId !== null) {
            $this->merge(['branch_id' => $forcedBranchId]);
        }
    }

    public function rules(): array
    {
        return [
            'branch_id' => ['nullable', 'exists:branches,id'],
            'customer_profile_id' => ['nullable', 'exists:customer_profiles,id'],
            'lead_id' => ['nullable', 'exists:leads,id'],
            'field_staff_id' => [
                'nullable',
                Rule::exists('users', 'id')->where('role', 'field_staff')->where('is_active', true),
            ],
            'event_id' => ['nullable', 'exists:events,id'],
            'source' => ['required', Rule::in(['offline', 'door_to_door', 'event'])],
            'payment_method_id' => ['required', 'exists:payment_methods,id'],
            'voucher_code' => ['nullable', 'string', 'max:255'],
            'staff_ref' => ['nullable', 'string', 'max:32'],
            'customer_name' => ['nullable', 'string', 'max:255'],
            'customer_whatsapp_number' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'sold_at' => ['required', 'date'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => [
                'nullable',
                Rule::exists('products', 'id')->where('is_active', true),
            ],
            'items.*.service_id' => [
                'nullable',
                Rule::exists('services', 'id')->where('is_active', true),
            ],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $user = $this->user();
                $branchId = $this->input('branch_id');

                if ($user && $branchId !== null && ! $user->canAccessBranch((int) $branchId)) {
                    $validator->errors()->add('branch_id', 'Anda hanya dapat membuat penjualan offline untuk cabang Anda sendiri.');
                }

                $items = $this->input('items', []);

                if (! is_array($items)) {
                    return;
                }

                foreach ($items as $index => $item) {
                    if (! is_array($item) || ! isset($item['quantity']) || ! is_numeric($item['quantity'])) {
                        continue;
                    }

                    if (empty($item['product_id']) && empty($item['service_id'])) {
                        $validator->errors()->add("items.{$index}.product_id", 'Item harus memiliki produk atau layanan.');
                        continue;
                    }

                    if (! empty($item['product_id'])) {
                        if (empty($branchId)) {
                            $validator->errors()->add('branch_id', 'Cabang wajib dipilih untuk transaksi dengan produk.');
                            continue;
                        }

                        $branchStock = BranchProductStock::query()
                            ->where('branch_id', $branchId)
                            ->where('product_id', $item['product_id'])
                            ->first();

                        if ($branchStock === null || (int) $item['quantity'] > $branchStock->stock_quantity) {
                            $validator->errors()->add("items.{$index}.quantity", 'Stok di cabang ini tidak mencukupi.');
                        }
                    }
                }
            },
        ];
    }
}
