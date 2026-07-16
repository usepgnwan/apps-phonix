<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BranchController extends Controller
{
    private function authorizeAdminPusat(): void
    {
        $user = request()->user();
        abort_unless($user !== null && $user->isAdminPusat(), 403, 'Hanya Admin Pusat yang dapat mengelola cabang.');
    }

    public function index()
    {
        $this->authorizeAdminPusat();

        $branches = Branch::query()
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Branches/Index', [
            'branches' => $branches,
        ]);
    }

    public function create()
    {
        $this->authorizeAdminPusat();

        return Inertia::render('Admin/Branches/Create');
    }

    public function store(Request $request)
    {
        $this->authorizeAdminPusat();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:branches,code',
            'address' => 'nullable|string',
            'phone_number' => 'nullable|string|max:20',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        if (Branch::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $validated['slug'] . '-' . time();
        }

        Branch::create($validated);

        return redirect()
            ->route('admin.branches.index')
            ->with('success', 'Cabang berhasil ditambahkan.');
    }

    public function edit(Branch $branch)
    {
        $this->authorizeAdminPusat();

        return Inertia::render('Admin/Branches/Edit', [
            'branch' => $branch,
        ]);
    }

    public function update(Request $request, Branch $branch)
    {
        $this->authorizeAdminPusat();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:branches,code,' . $branch->id,
            'address' => 'nullable|string',
            'phone_number' => 'nullable|string|max:20',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if ($branch->name !== $validated['name']) {
            $validated['slug'] = Str::slug($validated['name']);
            if (Branch::where('slug', $validated['slug'])->where('id', '!=', $branch->id)->exists()) {
                $validated['slug'] = $validated['slug'] . '-' . time();
            }
        }

        $branch->update($validated);

        return redirect()
            ->route('admin.branches.index')
            ->with('success', 'Cabang berhasil diperbarui.');
    }

    public function destroy(Branch $branch)
    {
        $this->authorizeAdminPusat();

        if ($branch->users()->count() > 0) {
            return redirect()->back()->with('error', 'Cabang tidak dapat dihapus karena masih memiliki user/staff.');
        }

        if ($branch->productStocks()->exists()) {
            return redirect()->back()->with('error', 'Cabang tidak dapat dihapus karena masih memiliki data stok produk.');
        }

        $branch->delete();

        return redirect()->back()->with('success', 'Cabang berhasil dihapus.');
    }
}
