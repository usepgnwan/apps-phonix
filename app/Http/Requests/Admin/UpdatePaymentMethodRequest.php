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
            'type' => ['required', Rule::in(['bank_transfer', 'qris', 'cash'])],
            'bank_name' => ['required_if:type,bank_transfer', 'nullable', 'string', 'max:255'],
            'account_number' => ['required_if:type,bank_transfer', 'nullable', 'string', 'max:255'],
            'account_holder_name' => ['required_if:type,bank_transfer', 'nullable', 'string', 'max:255'],
            'qris_image_path' => ['nullable', 'string', 'max:255'],
            'qris_image' => [Rule::requiredIf($this->requiresQrisImage()), 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'instructions' => ['nullable', 'string'],
            'is_active' => ['required', 'boolean'],
        ];
    }

    private function requiresQrisImage(): bool
    {
        $paymentMethod = $this->route('payment_method');

        return $this->input('type') === 'qris'
            && ! $this->hasFile('qris_image')
            && ! $paymentMethod?->qris_image_path;
    }
}
