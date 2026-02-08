'use client';

import { useState, useRef } from 'react';

const ZOOM_LEVEL = 2.5;
const LENS_SIZE = 140;

export default function ProductImageGallery({ images = [], fallbackImage = '', fallbackAlt = 'Product' }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [zoomLens, setZoomLens] = useState({ x: 0, y: 0, w: 0, h: 0, show: false });
    const imageContainerRef = useRef(null);

    const sortedImages = [...images].sort((a, b) => {
        if (a.is_primary) return -1;
        if (b.is_primary) return 1;
        return (a.position ?? 0) - (b.position ?? 0);
    });

    const displayImages = sortedImages.length > 0
        ? sortedImages.map((img) => img.image_url || img.imageUrl)
        : fallbackImage ? [fallbackImage] : [];

    const currentImage = displayImages[activeIndex] || displayImages[0];

    const handleMouseMove = (e) => {
        const el = imageContainerRef.current;
        if (!el || !currentImage) return;
        const rect = el.getBoundingClientRect();
        setZoomLens({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            w: rect.width,
            h: rect.height,
            show: true,
        });
    };

    const handleMouseLeave = () => {
        setZoomLens((prev) => ({ ...prev, show: false }));
    };

    if (!currentImage) {
        return (
            <div className="aspect-square max-h-80 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-8xl">🎁</span>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div
                ref={imageContainerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative overflow-hidden rounded-2xl shadow-xl aspect-square bg-gray-50 cursor-zoom-in"
            >
                <img
                    src={currentImage}
                    alt={fallbackAlt}
                    className="w-full h-full object-contain pointer-events-none"
                    draggable={false}
                />
                {zoomLens.show && zoomLens.w > 0 && (
                    <div
                        className="absolute pointer-events-none rounded-full border-2 border-white shadow-2xl bg-no-repeat"
                        style={{
                            width: LENS_SIZE,
                            height: LENS_SIZE,
                            left: zoomLens.x - LENS_SIZE / 2,
                            top: zoomLens.y - LENS_SIZE / 2,
                            backgroundImage: `url(${currentImage})`,
                            backgroundSize: `${zoomLens.w * ZOOM_LEVEL}px ${zoomLens.h * ZOOM_LEVEL}px`,
                            backgroundPosition: `${-zoomLens.x * ZOOM_LEVEL + LENS_SIZE / 2}px ${-zoomLens.y * ZOOM_LEVEL + LENS_SIZE / 2}px`,
                        }}
                    />
                )}
            </div>
            {displayImages.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                    {displayImages.map((url, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => setActiveIndex(index)}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${index === activeIndex
                                    ? 'border-purple-600 ring-2 ring-purple-200'
                                    : 'border-gray-200 hover:border-purple-400'
                                }`}
                        >
                            <img
                                src={url}
                                alt={`${fallbackAlt} ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
