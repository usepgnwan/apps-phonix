<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAffiliateCommissionRuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null && $user->isAdmin();
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'product_id' => ['nullable', 'integer', 'exists:products,id', 'required_without:service_id'],
            'service_id' => ['nullable', 'integer', 'exists:services,id', 'required_without:product_id'],
            'commission_type' => ['required', 'string', Rule::in(['fixed', 'percent'])],
            'commission_value' => ['required', 'numeric', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
