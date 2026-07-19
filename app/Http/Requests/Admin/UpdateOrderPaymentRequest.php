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
            'payment_method_id' => ['prohibited'],
            // Aksi admin dari menunggu bayar: lunas atau batalkan.
            'payment_status' => ['required', Rule::in(['paid', 'cancelled'])],
            'payment_received_at' => ['nullable', 'date'],
            'payment_notes' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'payment_status.required' => 'Aksi pembayaran wajib dipilih.',
            'payment_status.in' => 'Aksi pembayaran tidak valid. Pilih tandai lunas atau batalkan.',
            'payment_received_at.date' => 'Waktu pembayaran diterima tidak valid.',
            'payment_method_id.prohibited' => 'Metode pembayaran checkout tidak boleh diubah dari form ini.',
        ];
    }
}
