<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVoucherRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->has('code')) {
            $this->merge([
                'code' => strtoupper((string) $this->input('code')),
            ]);
        }
    }

    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null && $user->role === 'admin' && $user->is_active;
    }

    public function rules(): array
    {
        $voucher = $this->route('voucher');
        $discountType = $this->input('discount_type');

        return [
            'code' => ['required', 'string', 'max:255', Rule::unique('vouchers', 'code')->ignore($voucher?->id)],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'discount_type' => ['required', Rule::in(['fixed', 'percentage'])],
            'discount_value' => ['required', 'numeric', 'min:0', $discountType === 'percentage' ? 'max:100' : null],
            'minimum_purchase' => ['nullable', 'numeric', 'min:0'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['required', 'date', 'after_or_equal:starts_at'],
            'usage_limit' => ['required', 'integer', 'min:1'],
            'is_published' => ['required', 'boolean'],
            'target_audience' => ['required', Rule::in(['all', 'member', 'non_member'])],
        ];
    }
}
