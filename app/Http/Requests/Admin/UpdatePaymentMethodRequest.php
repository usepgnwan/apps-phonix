<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePaymentMethodRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null && $user->role === 'admin' && $user->is_active;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(['bank_transfer', 'qris'])],
            'bank_name' => ['required_if:type,bank_transfer', 'nullable', 'string', 'max:255'],
            'account_number' => ['required_if:type,bank_transfer', 'nullable', 'string', 'max:255'],
            'account_holder_name' => ['required_if:type,bank_transfer', 'nullable', 'string', 'max:255'],
            'qris_image_path' => ['required_if:type,qris', 'nullable', 'string', 'max:255'],
            'instructions' => ['nullable', 'string'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
