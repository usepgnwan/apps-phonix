export function isBranchAdmin(user) {
    return user?.role === 'admin' && user?.admin_scope === 'branch';
}

export function isCentralAdmin(user) {
    return user?.role === 'admin' && user?.admin_scope !== 'branch';
}

export function adminBranchId(user) {
    if (!isBranchAdmin(user) || user?.branch_id == null) {
        return null;
    }

    return Number(user.branch_id);
}

export function adminBranchName(user, branches = []) {
    if (isCentralAdmin(user)) {
        return null;
    }

    if (user?.branch?.name) {
        return user.branch.name;
    }

    const branchId = adminBranchId(user);
    if (branchId == null) {
        return null;
    }

    const match = branches.find((branch) => Number(branch.id) === branchId);

    return match?.name ?? null;
}

export function resolveFormBranchId(user, { defaultBranchId = null, branches = [], existingBranchId = null } = {}) {
    if (isBranchAdmin(user)) {
        return adminBranchId(user) ?? defaultBranchId ?? existingBranchId ?? '';
    }

    if (existingBranchId != null && existingBranchId !== '') {
        return existingBranchId;
    }

    if (defaultBranchId != null && defaultBranchId !== '') {
        return defaultBranchId;
    }

    return branches[0]?.id ?? '';
}

export function scopeBadgeLabel(user) {
    if (isCentralAdmin(user)) {
        return {
            role: 'Admin Pusat',
            branch: 'Semua cabang',
            short: 'Admin Pusat',
        };
    }

    if (isBranchAdmin(user)) {
        const name = user?.branch?.name || 'Cabang';
        return {
            role: 'Admin Cabang',
            branch: name,
            short: name,
        };
    }

    return {
        role: 'Admin',
        branch: null,
        short: 'Admin',
    };
}
