<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null && $user->role === 'admin' && $user->is_active;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(['waiting_shipping_confirmation', 'waiting_payment', 'payment_received', 'processing', 'shipped', 'completed', 'cancelled'])],
            'admin_notes' => ['nullable', 'string'],
        ];
    }
}
