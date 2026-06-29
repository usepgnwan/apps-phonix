<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Position;
use App\Models\Team;
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
        abort_unless($user !== null && $user->role === 'admin' && $user->is_active, 403);
    }

    public function index(Request $request)
    {
        $this->authorizeAdmin();

        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);
        $staff = User::query()
            ->where('role', 'field_staff')
            ->with(['position', 'team'])
            ->when($search, function ($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('phone_number', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Admin/Staff/Index', [
            'staff' => $staff,
            'positions' => Position::orderBy('name')->get(),
            'teams' => Team::orderBy('name')->get(),
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone_number' => 'nullable|string|max:255',
            'team_id' => 'nullable|exists:teams,id',
            'position_id' => 'nullable|exists:positions,id',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'nullable|string|min:8',
            'photo' => 'nullable|image|max:5120', // Max 5MB before compression
        ]);

        $validated['role'] = 'field_staff';
        $validated['password'] = Hash::make($validated['password'] ?? 'password123'); // Default password if empty

        if ($request->hasFile('photo')) {
            $manager = new ImageManager(new Driver());
            $image = $manager->decode($request->file('photo'));
            $image->scaleDown(width: 500);
            $filename = uniqid('staff_') . '.jpg';
            $encoded = $image->encodeUsingFormat(Format::JPEG, 80)->toString();
            Storage::disk('public')->put('staff-photos/' . $filename, $encoded);
            $validated['photo'] = 'staff-photos/' . $filename;
        }

        User::create($validated);

        return redirect()->route('admin.staff.index')->with('success', 'Staff berhasil ditambahkan.');
    }

    public function update(Request $request, User $staff)
    {
        $this->authorizeAdmin();
        abort_unless($staff->role === 'field_staff', 404);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone_number' => 'nullable|string|max:255',
            'team_id' => 'nullable|exists:teams,id',
            'position_id' => 'nullable|exists:positions,id',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($staff->id)],
            'password' => 'nullable|string|min:8',
            'photo' => 'nullable|image|max:5120',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        if ($request->hasFile('photo')) {
            $manager = new ImageManager(new Driver());
            $image = $manager->decode($request->file('photo'));
            $image->scaleDown(width: 500);
            $filename = uniqid('staff_') . '.jpg';
            $encoded = $image->encodeUsingFormat(Format::JPEG, 80)->toString();
            Storage::disk('public')->put('staff-photos/' . $filename, $encoded);
            
            if ($staff->photo) {
                Storage::disk('public')->delete($staff->photo);
            }
            
            $validated['photo'] = 'staff-photos/' . $filename;
        }

        $staff->update($validated);

        return redirect()->route('admin.staff.index')->with('success', 'Staff berhasil diperbarui.');
    }

    public function destroy(User $staff)
    {
        $this->authorizeAdmin();
        abort_unless($staff->role === 'field_staff', 404);

        if ($staff->offlineSales()->count() > 0 || $staff->assignedLeads()->count() > 0) {
            return redirect()->route('admin.staff.index')->with('error', 'Staff tidak dapat dihapus karena memiliki transaksi terkait.');
        }

        $staff->delete();

        return redirect()->route('admin.staff.index')->with('success', 'Staff berhasil dihapus.');
    }
}
