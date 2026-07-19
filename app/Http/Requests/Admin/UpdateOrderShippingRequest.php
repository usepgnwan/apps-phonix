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
            'tracking_number' => [
                'nullable',
                'string',
                'max:255',
                Rule::prohibitedIf($this->input('shipping_status') !== 'ready_to_ship'),
            ],
            'shipping_cost' => ['required', 'numeric', 'min:0'],
            // Aksi admin: konfirmasi ongkir atau siap dikirim (bukan status awal pending).
            'shipping_status' => ['required', Rule::in(['shipping_cost_confirmed', 'ready_to_ship'])],
            'shipping_notes' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'shipping_cost.required' => 'Ongkir wajib diisi.',
            'shipping_cost.numeric' => 'Ongkir harus berupa angka.',
            'shipping_cost.min' => 'Ongkir tidak boleh negatif.',
            'shipping_status.required' => 'Aksi pengiriman wajib dipilih.',
            'shipping_status.in' => 'Aksi pengiriman tidak valid.',
            'tracking_number.prohibited' => 'Nomor resi hanya diisi saat menandai siap dikirim.',
        ];
    }
}
