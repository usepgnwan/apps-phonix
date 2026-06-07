import { useState, useRef, useEffect } from 'react';

export default function BeforeAfterSlider({ beforeImage, afterImage, className = '' }) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleMove = (clientX) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percentage = (x / rect.width) * 100;
        setSliderPosition(percentage);
    };

    const onMouseMove = (e) => {
        if (!isDragging) return;
        handleMove(e.clientX);
    };

    const onTouchMove = (e) => {
        if (!isDragging) return;
        handleMove(e.touches[0].clientX);
    };

    const onMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
            window.addEventListener('touchmove', onTouchMove, { passive: false });
            window.addEventListener('touchend', onMouseUp);
        } else {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onMouseUp);
        };
    }, [isDragging]);

    return (
        <div 
            ref={containerRef}
            className={`relative w-full overflow-hidden select-none touch-none ${className}`}
            onMouseDown={(e) => {
                setIsDragging(true);
                handleMove(e.clientX);
            }}
            onTouchStart={(e) => {
                setIsDragging(true);
                handleMove(e.touches[0].clientX);
            }}
        >
            {/* Before Image (Bottom Layer) */}
            <img src={beforeImage} alt="Before" className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none" />
            
            {/* After Image (Top Layer) */}
            <img 
                src={afterImage} 
                alt="After" 
                className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            />
            
            {/* Slider Line & Handle */}
            <div 
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10 flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                style={{ left: `calc(${sliderPosition}% - 2px)` }}
            >
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-200 text-gray-800">
                    <span className="material-symbols-outlined text-sm">swap_horiz</span>
                </div>
            </div>
            
            {/* Labels */}
            <div className="absolute bottom-4 left-4 bg-primary/80 text-white px-3 py-1.5 rounded-full text-xs font-bold pointer-events-none backdrop-blur-sm">
                After
            </div>
            <div 
                className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1.5 rounded-full text-xs font-bold pointer-events-none backdrop-blur-sm" 
                style={{ opacity: sliderPosition < 80 ? 1 : 0, transition: 'opacity 0.2s' }}
            >
                Before
            </div>
        </div>
    );
}
