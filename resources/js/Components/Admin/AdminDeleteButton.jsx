import { router } from '@inertiajs/react';
import { useState } from 'react';

import DeleteConfirmationModal from '@/Components/Admin/DeleteConfirmationModal';

export default function AdminDeleteButton({
    children = 'Hapus',
    className = 'rounded-full border border-red-200 px-3 py-1.5 font-body-sm text-xs font-bold text-red-700 transition hover:bg-red-50',
    description,
    itemName,
    routeName,
    routeParams,
    title,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    function closeModal() {
        if (!processing) {
            setIsOpen(false);
        }
    }

    function confirmDelete() {
        setProcessing(true);
        router.delete(route(routeName, routeParams), {
            onFinish: () => setProcessing(false),
            onSuccess: () => setIsOpen(false),
        });
    }

    return (
        <>
            <button
                className={className}
                onClick={() => setIsOpen(true)}
                type="button"
            >
                {children}
            </button>
            <DeleteConfirmationModal
                description={description}
                isOpen={isOpen}
                itemName={itemName}
                onCancel={closeModal}
                onConfirm={confirmDelete}
                processing={processing}
                title={title}
            />
        </>
    );
}
