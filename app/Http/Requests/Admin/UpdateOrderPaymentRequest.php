<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null && $user->role === 'admin' && $user->is_active;
    }

    public function rules(): array
    {
        return [
            'payment_method_id' => [
                'nullable',
                'integer',
                Rule::exists('payment_methods', 'id')->where('is_active', true),
            ],
            'payment_status' => ['required', Rule::in(['pending', 'waiting_payment', 'paid', 'cancelled'])],
            'payment_received_at' => ['nullable', 'date'],
            'payment_notes' => ['nullable', 'string'],
        ];
    }
}
