import { useState } from 'react';

function FieldError({ message }) {
    return message ? (
        <p className="mt-1 font-body-sm text-xs text-red-700">{message}</p>
    ) : null;
}

export default function ImageUploadField({ error, label, onChange, currentImage }) {
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
        <label className="block">
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                {label} {isCompressing && <span className="text-[#F08A2B] ml-2 lowercase normal-case tracking-normal font-normal">(Sedang mengompres...)</span>}
            </span>
            <input
                type="file"
                accept="image/*"
                className="mt-2 block w-full text-sm text-[#333333] file:mr-4 file:rounded-full file:border-0 file:bg-[#1E4D3A]/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#1E4D3A] hover:file:bg-[#1E4D3A]/20"
                onChange={handleFileChange}
                disabled={isCompressing}
            />
            {preview && (
                <div className="mt-3">
                    <img src={preview} alt="Preview" className="h-32 w-32 object-cover rounded-xl border border-[#E5E7EB] shadow-sm" />
                </div>
            )}
            <FieldError message={error} />
        </label>
    );
}
