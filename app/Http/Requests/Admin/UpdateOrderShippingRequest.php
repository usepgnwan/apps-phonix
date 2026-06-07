<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderShippingRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null && $user->role === 'admin' && $user->is_active;
    }

    public function rules(): array
    {
        return [
            'courier_name' => ['nullable', 'string', 'max:255'],
            'tracking_number' => ['nullable', 'string', 'max:255', Rule::prohibitedIf($this->input('shipping_status') !== 'ready_to_ship')],
            'shipping_cost' => ['required', 'numeric', 'min:0'],
            'shipping_status' => ['required', Rule::in(['pending_shipping_confirmation', 'shipping_cost_confirmed', 'ready_to_ship'])],
            'shipping_notes' => ['nullable', 'string'],
        ];
    }
}
