<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Position;
use App\Models\Team;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Format;

class StaffController extends Controller
{
    private function authorizeAdmin(): void
    {
        $user = request()->user();
        abort_unless($user !== null && $user->isAdmin(), 403);
    }

    private function ensureStaffInScope(User $actor, User $staff): void
    {
        abort_unless($staff->role === 'field_staff', 404);

        $actor->ensureCanAccessBranch(
            $staff->branch_id !== null ? (int) $staff->branch_id : null,
            'Anda tidak memiliki akses ke staff cabang lain.'
        );
    }

    public function index(Request $request)
    {
        $this->authorizeAdmin();

        $user = $request->user();
        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);

        $staffQuery = User::query()
            ->where('role', 'field_staff')
            ->with(['position', 'team', 'branch']);
        $user->applyBranchScope($staffQuery);

        $staff = $staffQuery
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('phone_number', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Admin/Staff/Index', [
            'staff' => $staff,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function create(Request $request)
    {
        $this->authorizeAdmin();

        return Inertia::render('Admin/Staff/Create', $this->formOptions($request->user()));
    }

    public function store(Request $request)
    {
        $this->authorizeAdmin();

        $actor = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone_number' => 'nullable|string|max:255',
            'team_id' => 'nullable|exists:teams,id',
            'branch_id' => ['required', 'exists:branches,id'],
            'position_id' => 'nullable|exists:positions,id',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'nullable|string|min:8',
            'photo' => 'nullable|image|max:5120',
        ]);

        if ($actor->isAdminCabang()) {
            $actor->ensureCanAccessBranch(
                isset($validated['branch_id']) ? (int) $validated['branch_id'] : null,
                'Anda hanya dapat menambahkan staff ke cabang Anda sendiri.'
            );
            $validated['branch_id'] = $actor->forcedBranchId();
        }

        $validated['role'] = 'field_staff';
        $validated['admin_scope'] = null;
        $validated['is_active'] = true;
        $validated['password'] = Hash::make($validated['password'] ?? 'password123');

        if ($request->hasFile('photo')) {
            $validated['photo'] = $this->storeStaffPhoto($request->file('photo'));
        }

        User::create($validated);

        return redirect()->route('admin.staff.index')->with('success', 'Staff berhasil ditambahkan.');
    }

    public function edit(Request $request, User $staff)
    {
        $this->authorizeAdmin();

        $actor = $request->user();
        $this->ensureStaffInScope($actor, $staff);

        $staff->load('branch');

        return Inertia::render('Admin/Staff/Edit', [
            'staff' => $staff,
            ...$this->formOptions($actor),
        ]);
    }

    public function update(Request $request, User $staff)
    {
        $this->authorizeAdmin();

        $actor = $request->user();
        $this->ensureStaffInScope($actor, $staff);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone_number' => 'nullable|string|max:255',
            'team_id' => 'nullable|exists:teams,id',
            'branch_id' => ['required', 'exists:branches,id'],
            'position_id' => 'nullable|exists:positions,id',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($staff->id)],
            'password' => 'nullable|string|min:8',
            'photo' => 'nullable|image|max:5120',
        ]);

        if ($actor->isAdminCabang()) {
            $actor->ensureCanAccessBranch(
                isset($validated['branch_id']) ? (int) $validated['branch_id'] : null,
                'Anda hanya dapat menempatkan staff di cabang Anda sendiri.'
            );
            $validated['branch_id'] = $actor->forcedBranchId();
        }

        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        if ($request->hasFile('photo')) {
            if ($staff->photo) {
                Storage::disk('public')->delete($staff->photo);
            }
            $validated['photo'] = $this->storeStaffPhoto($request->file('photo'));
        }

        $staff->update($validated);

        return redirect()->route('admin.staff.index')->with('success', 'Staff berhasil diperbarui.');
    }

    private function storeStaffPhoto($file): string
    {
        $manager = new ImageManager(new Driver());
        $image = $manager->decode($file);
        $image->scaleDown(width: 500);
        $filename = uniqid('staff_') . '.jpg';
        $encoded = $image->encodeUsingFormat(Format::JPEG, 80)->toString();
        Storage::disk('public')->put('staff-photos/' . $filename, $encoded);

        return 'staff-photos/' . $filename;
    }

    private function formOptions(User $user): array
    {
        $forcedBranchId = $user->forcedBranchId();
        $branches = $forcedBranchId
            ? Branch::query()->where('id', $forcedBranchId)->orderBy('name')->get()
            : Branch::query()->orderBy('name')->get();

        return [
            // Semua jabatan dari master positions (bukan hardcode hierarchy).
            'positions' => Position::query()->orderBy('name')->get(),
            'teams' => Team::query()->orderBy('name')->get(),
            'branches' => $branches,
            'defaultBranchId' => $forcedBranchId,
        ];
    }

    public function destroy(User $staff)
    {
        $this->authorizeAdmin();

        $actor = request()->user();
        $this->ensureStaffInScope($actor, $staff);

        if ($staff->offlineSales()->count() > 0 || $staff->assignedLeads()->count() > 0) {
            return redirect()->route('admin.staff.index')->with('error', 'Staff tidak dapat dihapus karena memiliki transaksi terkait.');
        }

        $staff->delete();

        return redirect()->route('admin.staff.index')->with('success', 'Staff berhasil dihapus.');
    }
}
