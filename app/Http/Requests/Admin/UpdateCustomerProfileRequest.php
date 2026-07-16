<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCustomerProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $customerProfile = $this->route('customerProfile');

        return $user !== null
            && $user->isAdmin()
            && $customerProfile !== null
            && $customerProfile->isVisibleToAdmin($user);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'whatsapp_number' => ['required', 'string', 'max:30'],
            'primary_address' => ['required', 'string', 'max:1000'],
            'member_status' => ['required', Rule::in(['non_member', 'member'])],
            'internal_notes' => ['nullable', 'string'],
        ];
    }
}
