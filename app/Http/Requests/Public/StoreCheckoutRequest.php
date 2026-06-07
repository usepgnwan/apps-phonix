<?php

namespace App\Http\Requests\Public;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_whatsapp_number' => ['required', 'string', 'max:255'],
            'customer_email' => ['required', 'email', 'max:255'],
            'payment_method_id' => ['required', Rule::exists('payment_methods', 'id')->where('is_active', true)],
            'shipping_address' => ['required', 'string', 'max:5000'],
            'voucher_code' => ['nullable', 'string', 'max:255'],
        ];
    }
}
