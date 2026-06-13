import { Head, Link, useForm } from '@inertiajs/react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox';
import AdminLayout from '@/Layouts/AdminLayout';

function AdminVideoCreate() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        video_link: '',
        is_pinned: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.videos.store'));
    };

    return (
        <>
            <Head title="Tambah Video" />

            <div className="space-y-8">
                <AdminPageHeader
                    description="Tambahkan video baru untuk ditampilkan di halaman utama."
                    eyebrow="Konten / Video"
                    title="Tambah Video"
                />

                <AdminCard className="p-6">
                    <form onSubmit={submit} className="space-y-6 max-w-2xl">
                        <div>
                            <InputLabel htmlFor="title" value="Judul Video" />
                            <TextInput
                                id="title"
                                type="text"
                                name="title"
                                value={data.title}
                                className="mt-1 block w-full"
                                isFocused={true}
                                onChange={(e) => setData('title', e.target.value)}
                                required
                            />
                            <InputError message={errors.title} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="video_link" value="Link Video (YouTube URL atau MP4 URL)" />
                            <TextInput
                                id="video_link"
                                type="url"
                                name="video_link"
                                value={data.video_link}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('video_link', e.target.value)}
                                required
                                placeholder="Contoh: https://www.youtube.com/watch?v=... atau https://domain.com/video.mp4"
                            />
                            <InputError message={errors.video_link} className="mt-2" />
                        </div>

                        <div className="block">
                            <label className="flex items-center">
                                <Checkbox
                                    name="is_pinned"
                                    checked={data.is_pinned}
                                    onChange={(e) => setData('is_pinned', e.target.checked)}
                                />
                                <span className="ms-2 text-sm text-gray-600">Sematkan (Pin) video ini agar tampil di halaman utama</span>
                            </label>
                            <InputError message={errors.is_pinned} className="mt-2" />
                        </div>

                        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                            <PrimaryButton disabled={processing}>
                                Simpan Video
                            </PrimaryButton>
                            <Link href={route('admin.videos.index')} className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                                Batal
                            </Link>
                        </div>
                    </form>
                </AdminCard>
            </div>
        </>
    );
}

AdminVideoCreate.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminVideoCreate;
