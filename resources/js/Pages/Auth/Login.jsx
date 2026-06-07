import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Login({ status, canResetPassword }) {
    const emailInput = useRef(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        emailInput.current?.focus();
    }, []);

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout fullScreen>
            <Head title="Masuk" />

            <div className="flex min-h-screen flex-col items-center justify-center bg-[#6FA788] px-margin-mobile py-10 font-body-md text-on-surface md:px-margin-desktop">
                <Link
                    href="/"
                    className="mb-6 flex flex-col items-center rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary-container focus:ring-offset-2 focus:ring-offset-[#6FA788]"
                    aria-label="Phoenix Terapi & Herbal"
                >
                    <img
                        src="/images/logo_blue_box.png"
                        alt="Logo Phoenix Terapi & Herbal"
                        className="h-auto w-40 rounded-xl object-contain shadow-sm shadow-black/10 sm:w-44"
                    />
                </Link>

                <section className="w-full max-w-md rounded-lg border border-outline-variant bg-white px-6 py-6 shadow-sm sm:px-8">
                    {status && (
                        <div className="mb-5 rounded-lg border border-primary-fixed-dim bg-primary-fixed-dim/20 px-4 py-3 font-body-sm text-sm font-medium text-primary-container">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <label
                                htmlFor="email"
                                className="block font-label-sm text-xs font-semibold uppercase tracking-wide text-on-surface"
                            >
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-2 block w-full rounded-lg border-outline-variant bg-white px-3 py-2.5 font-body-sm text-sm text-on-surface shadow-sm transition focus:border-primary-container focus:ring-primary-container"
                                autoComplete="username"
                                ref={emailInput}
                                onChange={(e) => setData('email', e.target.value)}
                            />

                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block font-label-sm text-xs font-semibold uppercase tracking-wide text-on-surface"
                            >
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-2 block w-full rounded-lg border-outline-variant bg-white px-3 py-2.5 font-body-sm text-sm text-on-surface shadow-sm transition focus:border-primary-container focus:ring-primary-container"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                            />

                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <label htmlFor="remember" className="flex items-center">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    checked={data.remember}
                                    className="border-outline-variant text-primary-container focus:ring-primary-container"
                                    onChange={(e) =>
                                        setData('remember', e.target.checked)
                                    }
                                />
                                <span className="ms-2 font-body-sm text-sm text-on-surface/75">
                                    Ingat saya
                                </span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="rounded font-body-sm text-sm font-medium text-primary-container underline-offset-4 transition hover:text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary-container focus:ring-offset-2"
                                >
                                    Lupa password?
                                </Link>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="inline-flex w-full items-center justify-center rounded-lg bg-primary-container px-4 py-2.5 font-label-md text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary-container focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={processing}
                        >
                            {processing ? 'Memproses...' : 'Masuk'}
                        </button>
                    </form>
                </section>
            </div>
        </GuestLayout>
    );
}
