<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAffiliateCommissionRuleRequest;
use App\Http\Requests\Admin\UpdateAffiliateCommissionRuleRequest;
use App\Models\AffiliateCommissionRule;
use App\Models\Product;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AffiliateCommissionRuleController extends Controller
{
    private function authorizeAdmin(): User
    {
        $user = request()->user();
        abort_unless($user !== null && $user->isAdmin(), 403);

        return $user;
    }

    public function index(Request $request): Response
    {
        $this->authorizeAdmin();

        $rules = AffiliateCommissionRule::query()
            ->with(['product:id,name,price', 'service:id,name,price'])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/AffiliateCommissionRules/Index', [
            'page' => 'admin.affiliate-commission-rules.index',
            'rules' => $rules,
            'products' => Product::query()->orderBy('name')->get(['id', 'name', 'price']),
            'services' => Service::query()->orderBy('name')->get(['id', 'name', 'price']),
        ]);
    }

    public function store(StoreAffiliateCommissionRuleRequest $request): RedirectResponse
    {
        $this->authorizeAdmin();

        $validated = $request->validated();

        if (! empty($validated['product_id']) && ! empty($validated['service_id'])) {
            return back()->withErrors([
                'product_id' => 'Pilih product atau service saja, tidak keduanya.',
            ]);
        }

        AffiliateCommissionRule::query()->create([
            'name' => $validated['name'],
            'product_id' => $validated['product_id'] ?? null,
            'service_id' => $validated['service_id'] ?? null,
            'commission_type' => $validated['commission_type'],
            'commission_value' => $validated['commission_value'],
            'is_active' => $validated['is_active'] ?? true,
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return redirect()
            ->route('admin.affiliate-commission-rules.index')
            ->with('success', 'Aturan komisi berhasil ditambahkan.');
    }

    public function update(UpdateAffiliateCommissionRuleRequest $request, AffiliateCommissionRule $affiliateCommissionRule): RedirectResponse
    {
        $this->authorizeAdmin();

        $affiliateCommissionRule->update($request->validated());

        return redirect()
            ->route('admin.affiliate-commission-rules.index')
            ->with('success', 'Aturan komisi berhasil diperbarui.');
    }
}
