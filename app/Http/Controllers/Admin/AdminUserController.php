<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController extends Controller
{
    private function authorizeAdminPusat(): void
    {
        $user = request()->user();
        abort_unless($user !== null && $user->isAdminPusat(), 403, 'Hanya Admin Pusat yang dapat mengelola admin.');
    }

    public function index(Request $request): Response
    {
        $this->authorizeAdminPusat();

        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);

        $admins = User::query()
            ->where('role', 'admin')
            ->with(['branch:id,name,code'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Admin/Admins/Index', [
            'admins' => $admins,
            'branches' => Branch::query()->orderBy('name')->get(['id', 'name', 'code', 'is_active']),
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeAdminPusat();

        $request->merge([
            'is_active' => $request->boolean('is_active'),
            'branch_id' => $request->filled('branch_id') ? $request->input('branch_id') : null,
        ]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['nullable', 'string', 'min:8'],
            'phone_number' => ['nullable', 'string', 'max:255'],
            'admin_scope' => ['required', Rule::in(['central', 'branch'])],
            'branch_id' => [
                Rule::requiredIf(fn () => $request->input('admin_scope') === 'branch'),
                'nullable',
                'exists:branches,id',
            ],
            'is_active' => ['required', 'boolean'],
        ]);

        if ($validated['admin_scope'] === 'central') {
            $validated['branch_id'] = $validated['branch_id'] ?? null;
        }

        User::query()->create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password'] ?? 'password123'),
            'phone_number' => $validated['phone_number'] ?? null,
            'role' => 'admin',
            'admin_scope' => $validated['admin_scope'],
            'branch_id' => $validated['branch_id'] ?? null,
            'is_active' => $validated['is_active'],
            'team_id' => null,
            'position_id' => null,
        ]);

        return redirect()
            ->route('admin.admins.index')
            ->with('success', 'Admin berhasil ditambahkan.');
    }

    public function update(Request $request, User $admin): RedirectResponse
    {
        $this->authorizeAdminPusat();
        abort_unless($admin->role === 'admin', 404);

        $request->merge([
            'is_active' => $request->boolean('is_active'),
            'branch_id' => $request->filled('branch_id') ? $request->input('branch_id') : null,
        ]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($admin->id)],
            'password' => ['nullable', 'string', 'min:8'],
            'phone_number' => ['nullable', 'string', 'max:255'],
            'admin_scope' => ['required', Rule::in(['central', 'branch'])],
            'branch_id' => [
                Rule::requiredIf(fn () => $request->input('admin_scope') === 'branch'),
                'nullable',
                'exists:branches,id',
            ],
            'is_active' => ['required', 'boolean'],
        ]);

        // Jangan nonaktifkan diri sendiri
        if ($request->user()->id === $admin->id && ! $validated['is_active']) {
            return redirect()
                ->route('admin.admins.index')
                ->with('error', 'Anda tidak dapat menonaktifkan akun admin Anda sendiri.');
        }

        // Jangan turunkan scope diri sendiri dari central jika itu satu-satunya central aktif
        if (
            $request->user()->id === $admin->id
            && $admin->admin_scope === 'central'
            && $validated['admin_scope'] === 'branch'
        ) {
            $otherCentralActive = User::query()
                ->where('role', 'admin')
                ->where('admin_scope', 'central')
                ->where('is_active', true)
                ->where('id', '!=', $admin->id)
                ->exists();

            if (! $otherCentralActive) {
                return redirect()
                    ->route('admin.admins.index')
                    ->with('error', 'Tidak dapat mengubah scope: Anda adalah Admin Pusat aktif terakhir.');
            }
        }

        $payload = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'] ?? null,
            'admin_scope' => $validated['admin_scope'],
            'branch_id' => $validated['admin_scope'] === 'branch' ? $validated['branch_id'] : ($validated['branch_id'] ?? null),
            'is_active' => $validated['is_active'],
            'role' => 'admin',
        ];

        if (! empty($validated['password'])) {
            $payload['password'] = Hash::make($validated['password']);
        }

        $admin->update($payload);

        return redirect()
            ->route('admin.admins.index')
            ->with('success', 'Admin berhasil diperbarui.');
    }

    public function destroy(Request $request, User $admin): RedirectResponse
    {
        $this->authorizeAdminPusat();
        abort_unless($admin->role === 'admin', 404);

        if ($request->user()->id === $admin->id) {
            return redirect()
                ->route('admin.admins.index')
                ->with('error', 'Anda tidak dapat menghapus akun admin Anda sendiri.');
        }

        if ($admin->admin_scope === 'central' && $admin->is_active) {
            $otherCentralActive = User::query()
                ->where('role', 'admin')
                ->where('admin_scope', 'central')
                ->where('is_active', true)
                ->where('id', '!=', $admin->id)
                ->exists();

            if (! $otherCentralActive) {
                return redirect()
                    ->route('admin.admins.index')
                    ->with('error', 'Tidak dapat menghapus Admin Pusat aktif terakhir.');
            }
        }

        // Soft-deactivate lebih aman daripada hard delete
        $admin->update(['is_active' => false]);

        return redirect()
            ->route('admin.admins.index')
            ->with('success', 'Admin dinonaktifkan.');
    }
}
