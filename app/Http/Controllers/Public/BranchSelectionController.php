<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Services\CartResolver;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class BranchSelectionController extends Controller
{
    public function __construct(private readonly CartResolver $cartResolver)
    {
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'branch_id' => ['required', 'exists:branches,id'],
        ]);

        $newBranchId = $validated['branch_id'];
        $request->session()->put('selected_branch_id', $newBranchId);

        // Jika user memiliki isi cart yang berbeda cabang
        $cart = $this->cartResolver->existing($request);
        if ($cart && $cart->cartItems()->count() > 0 && $cart->branch_id !== null && $cart->branch_id !== $newBranchId) {
            $cart->cartItems()->delete();
            $cart->update(['branch_id' => $newBranchId]);
            return back()->with('error', 'Keranjang Anda telah dikosongkan karena Anda memilih cabang yang berbeda.');
        }

        return back()->with('success', 'Cabang berhasil dipilih.');
    }
}
