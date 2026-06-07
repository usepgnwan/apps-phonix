<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

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
            'payment_method_id' => ['prohibited'],
            'payment_status' => ['required', 'in:pending,waiting_payment,paid,cancelled'],
            'payment_received_at' => ['nullable', 'date'],
            'payment_notes' => ['nullable', 'string'],
        ];
    }
}
