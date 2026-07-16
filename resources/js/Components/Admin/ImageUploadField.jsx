import { useId, useState } from 'react';
import { FieldError } from '@/Components/Admin/FormFields';

export default function ImageUploadField({ error, label, onChange, currentImage }) {
    const inputId = useId();
    const [preview, setPreview] = useState(currentImage || null);
    const [isCompressing, setIsCompressing] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            setPreview(currentImage || null);
            onChange(null);
            return;
        }

        setIsCompressing(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxSize = 1200; // max dimension for compression
                let width = img.width;
                let height = img.height;
                
                if (width > height && width > maxSize) {
                    height *= maxSize / width;
                    width = maxSize;
                } else if (height > maxSize) {
                    width *= maxSize / height;
                    height = maxSize;
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob((blob) => {
                    if (blob.size > 4 * 1024 * 1024) {
                        alert('Gambar terlalu besar meskipun sudah dikompres. Maksimal 4MB.');
                        setIsCompressing(false);
                        return;
                    }
                    
                    const compressedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    });
                    
                    setPreview(URL.createObjectURL(compressedFile));
                    onChange(compressedFile);
                    setIsCompressing(false);
                }, 'image/jpeg', 0.85); // 85% quality
            };
        };
        reader.onerror = () => {
            alert('Gagal membaca file gambar.');
            setIsCompressing(false);
        };
    };

    return (
        <div className="block">
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                {label} {isCompressing && <span className="text-[#F08A2B] ml-2 lowercase normal-case tracking-normal font-normal">(Sedang mengompres...)</span>}
            </span>
            <input
                id={inputId}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleFileChange}
            />
            <label
                htmlFor={isCompressing ? undefined : inputId}
                aria-disabled={isCompressing}
                className={`mt-2 flex w-full items-center justify-between gap-4 rounded-2xl border border-dashed border-[#1E4D3A]/40 bg-[#1E4D3A]/5 px-4 py-3 text-left font-body-sm text-sm text-[#333333] transition hover:border-[#1E4D3A] hover:bg-[#1E4D3A]/10 focus-within:ring-2 focus-within:ring-[#1E4D3A] focus-within:ring-offset-2 ${
                    isCompressing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                }`}
            >
                <span>{preview ? 'Ganti gambar thumbnail' : 'Pilih gambar thumbnail'}</span>
                <span className="rounded-full bg-[#1E4D3A] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white">
                    Pilih File
                </span>
            </label>
            {preview && (
                <div className="mt-3">
                    <img src={preview} alt="Preview" className="h-32 w-32 object-cover rounded-xl border border-[#E5E7EB] shadow-sm" />
                </div>
            )}
            <FieldError message={error} />
        </div>
    );
}
