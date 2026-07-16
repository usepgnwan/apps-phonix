import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const inputClassName =
    'w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#1E4D3A] focus:ring-1 focus:ring-[#1E4D3A]';

export function Field({ label, error, className = '', children }) {
    return (
        <div className={className}>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
            {children}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

export function Section({ title, children }) {
    return (
        <section className="space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{title}</p>
            {children}
        </section>
    );
}

export function PasswordField({ label, value, onChange, error, placeholder }) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <Field label={label} error={error}>
            <div className="relative">
                <input
                    type={showPassword ? 'text' : 'password'}
                    className={`${inputClassName} pr-11`}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    autoComplete="new-password"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 transition hover:text-[#1E4D3A] focus:outline-none"
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                    {showPassword ? (
                        <EyeOff aria-hidden="true" className="h-4 w-4" />
                    ) : (
                        <Eye aria-hidden="true" className="h-4 w-4" />
                    )}
                </button>
            </div>
        </Field>
    );
}

export function StaffFormFields({
    data,
    setData,
    errors,
    positions,
    teams,
    branches,
    photoPreview,
    onPhotoChange,
    isBranchLocked,
    branchDisplayName,
    isEdit = false,
}) {
    return (
        <div className="space-y-6">
            <Section title="Identitas">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Nama Lengkap" error={errors.name} className="md:col-span-2">
                        <input
                            type="text"
                            className={inputClassName}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                    </Field>
                    <Field label="Email" error={errors.email}>
                        <input
                            type="email"
                            className={inputClassName}
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                    </Field>
                    <Field label="No. Telepon" error={errors.phone_number}>
                        <input
                            type="text"
                            className={inputClassName}
                            value={data.phone_number}
                            onChange={(e) => setData('phone_number', e.target.value)}
                        />
                    </Field>
                </div>
            </Section>

            <div className="border-t border-gray-100" />

            <Section title="Penempatan">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Jabatan" error={errors.position_id}>
                        <select
                            className={inputClassName}
                            value={data.position_id}
                            onChange={(e) => setData('position_id', e.target.value)}
                        >
                            <option value="">-- Pilih Jabatan --</option>
                            {positions.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Tim" error={errors.team_id}>
                        <select
                            className={inputClassName}
                            value={data.team_id}
                            onChange={(e) => setData('team_id', e.target.value)}
                        >
                            <option value="">-- Pilih Tim --</option>
                            {teams.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Cabang" error={errors.branch_id}>
                        {isBranchLocked ? (
                            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-700">
                                {branchDisplayName}
                            </div>
                        ) : (
                            <select
                                className={inputClassName}
                                value={data.branch_id}
                                onChange={(e) => setData('branch_id', e.target.value)}
                                required
                            >
                                <option value="">-- Pilih Cabang --</option>
                                {branches?.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </Field>
                    <PasswordField
                        label={isEdit ? 'Password Baru (opsional)' : 'Password'}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        error={errors.password}
                        placeholder={
                            isEdit
                                ? 'Kosongkan jika tidak ingin mengubah password'
                                : 'Kosongkan untuk default: password123'
                        }
                    />
                </div>
            </Section>

            <div className="border-t border-gray-100" />

            <Section title="Foto Profil">
                <Field label="Foto Profil (Opsional)" error={errors.photo}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        {photoPreview ? (
                            <img
                                src={photoPreview}
                                alt="Preview"
                                className="h-20 w-20 shrink-0 rounded-full border border-gray-200 object-cover"
                            />
                        ) : (
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-xs text-gray-400">
                                No Image
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={onPhotoChange}
                            className="min-w-0 flex-1 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-[#1E4D3A]/10 file:px-4 file:py-2 file:text-sm file:font-bold file:text-[#1E4D3A] hover:file:bg-[#1E4D3A]/20"
                        />
                    </div>
                </Field>
            </Section>
        </div>
    );
}
