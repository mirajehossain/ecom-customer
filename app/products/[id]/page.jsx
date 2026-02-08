'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { productsAPI } from '@/lib/api';
import { cartStore } from '@/lib/cart';
import { wishlistStore } from '@/lib/wishlist';
import Header from '@/app/components/Header';
import { useState, useEffect, useRef } from 'react';

export default function ProductDetailPage() {
    const { id } = useParams();
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [zoomLens, setZoomLens] = useState({ x: 0, y: 0, w: 0, h: 0, show: false });
    const imageContainerRef = useRef(null);

    const ZOOM_LEVEL = 2.5;
    const LENS_SIZE = 140;

    const { data, isLoading } = useQuery({
        queryKey: ['product', id],
        queryFn: () => productsAPI.getById(id),
    });

    const product = data?.data;

    useEffect(() => {
        if (product) {
            setIsInWishlist(wishlistStore.getState().isInWishlist(product.id));
        }
    }, [product]);

    const handleAddToCart = () => {
        const productToAdd = {
            ...product,
            variant_id: selectedVariant?.id || 0,
            variant_name: selectedVariant?.name || '',
        };
        cartStore.add(productToAdd);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const handleImageMouseMove = (e) => {
        const el = imageContainerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setZoomLens({ x, y, w: rect.width, h: rect.height, show: true });
    };

    const handleImageMouseLeave = () => {
        setZoomLens((prev) => ({ ...prev, show: false }));
    };

    const handleToggleWishlist = () => {
        if (isInWishlist) {
            wishlistStore.getState().remove(product.id);
            setIsInWishlist(false);
        } else {
            wishlistStore.getState().add(product);
            setIsInWishlist(true);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-red-600">Product not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
            <Header />

            {/* Product Detail */}
            <div className="container mx-auto px-4 py-12">
                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Product Image */}
                        <div className="relative flex justify-center lg:justify-start">
                            <div className="sticky top-24 max-w-sm w-full">
                                {(selectedVariant?.image || product.image) ? (
                                    <div
                                        ref={imageContainerRef}
                                        onMouseMove={handleImageMouseMove}
                                        onMouseLeave={handleImageMouseLeave}
                                        className="relative overflow-hidden rounded-2xl shadow-xl aspect-square bg-gray-50 cursor-zoom-in"
                                    >
                                        <img
                                            src={selectedVariant?.image || product.image}
                                            alt={selectedVariant?.name || product.name}
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
                                                    backgroundImage: `url(${selectedVariant?.image || product.image})`,
                                                    backgroundSize: `${zoomLens.w * ZOOM_LEVEL}px ${zoomLens.h * ZOOM_LEVEL}px`,
                                                    backgroundPosition: `${-zoomLens.x * ZOOM_LEVEL + LENS_SIZE / 2}px ${-zoomLens.y * ZOOM_LEVEL + LENS_SIZE / 2}px`,
                                                }}
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
                                        {selectedVariant && (
                                            <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg pointer-events-none">
                                                {selectedVariant.name}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="aspect-square max-h-80 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center shadow-xl">
                                        <span className="text-8xl">🎁</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Product Info */}
                        <div>
                            <div className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
                                ✨ Featured Product
                            </div>

                            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                                {product.name}
                            </h1>

                            <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
                                <div className="flex items-baseline gap-4">
                                    <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                                        ${parseFloat(selectedVariant?.price || product.price).toFixed(2)}
                                    </span>
                                    {product.compare_price && (
                                        <>
                                            <span className="text-2xl text-gray-400 line-through">
                                                ${parseFloat(product.compare_price).toFixed(2)}
                                            </span>
                                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                                SAVE {Math.round((1 - (selectedVariant?.price || product.price) / product.compare_price) * 100)}%
                                            </span>
                                        </>
                                    )}
                                </div>
                                {selectedVariant && (
                                    <div className="mt-3 text-sm text-purple-700 font-semibold">
                                        ✨ Variant: {selectedVariant.name}
                                    </div>
                                )}
                            </div>

                            <div className="mb-8 p-6 bg-gray-50 rounded-2xl">
                                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <span>📝</span> Description
                                </h3>
                                <p className="text-gray-700 leading-relaxed">{product.description}</p>
                            </div>

                            <div className="mb-8 flex items-center gap-6 p-4 bg-blue-50 rounded-xl">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">SKU</p>
                                    <p className="font-bold text-gray-800">{selectedVariant?.sku || product.sku || 'N/A'}</p>
                                </div>
                                <div className="h-8 w-px bg-gray-300"></div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Availability</p>
                                    <p className={`font-bold ${(selectedVariant?.stock !== undefined ? selectedVariant.stock : product.stock_quantity) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {(selectedVariant?.stock !== undefined ? selectedVariant.stock : product.stock_quantity) > 0
                                            ? `${selectedVariant?.stock !== undefined ? selectedVariant.stock : product.stock_quantity} in stock`
                                            : 'Out of stock'}
                                    </p>
                                </div>
                            </div>

                            {/* Variants */}
                            {product.variants && Array.isArray(product.variants) && product.variants.length > 0 && (
                                <div className="mb-8">
                                    <label className="block text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <span>🎨</span> Choose Your Option
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {product.variants.map((variant) => (
                                            <button
                                                key={variant.id}
                                                onClick={() => setSelectedVariant(variant)}
                                                className={`px-5 py-4 border-2 rounded-2xl text-sm font-bold transition-all transform hover:scale-105 ${selectedVariant?.id === variant.id
                                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-600 shadow-xl scale-105'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:border-purple-500 shadow-md'
                                                    }`}
                                            >
                                                <div className="font-bold">{variant.name || 'Default'}</div>
                                                {variant.price && (
                                                    <div className="text-xs mt-1 font-semibold">
                                                        ${parseFloat(variant.price).toFixed(2)}
                                                    </div>
                                                )}
                                                {variant.stock !== undefined && (
                                                    <div className={`text-xs mt-1 font-medium ${selectedVariant?.id === variant.id
                                                        ? 'text-white'
                                                        : variant.stock > 0 ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                        {variant.stock > 0 ? `${variant.stock} left` : 'Out of stock'}
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity and Add to Cart */}
                            <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
                                <label className="block text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span>🔢</span> Quantity
                                </label>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-12 h-12 bg-white border-2 border-purple-300 rounded-xl hover:bg-purple-100 font-bold text-xl shadow-md hover:shadow-lg transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={quantity <= 1}
                                    >
                                        −
                                    </button>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-24 px-4 py-3 border-2 border-purple-300 rounded-xl text-center font-bold text-xl shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        min="1"
                                        max={selectedVariant?.stock !== undefined ? selectedVariant.stock : product.stock_quantity}
                                    />
                                    <button
                                        onClick={() => setQuantity(Math.min(
                                            selectedVariant?.stock !== undefined ? selectedVariant.stock : product.stock_quantity,
                                            quantity + 1
                                        ))}
                                        className="w-12 h-12 bg-white border-2 border-purple-300 rounded-xl hover:bg-purple-100 font-bold text-xl shadow-md hover:shadow-lg transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={quantity >= (selectedVariant?.stock !== undefined ? selectedVariant.stock : product.stock_quantity)}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={
                                        addedToCart ||
                                        (product.variants && Array.isArray(product.variants) && product.variants.length > 0 && !selectedVariant) ||
                                        (selectedVariant ? selectedVariant.stock === 0 : product.stock_quantity === 0)
                                    }
                                    className="flex-1 btn-ripple bg-gradient-to-r from-purple-600 to-pink-600 text-white py-5 px-8 rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-xl disabled:shadow-none"
                                >
                                    {addedToCart ? '✓ Added to Cart!' :
                                        (product.variants && Array.isArray(product.variants) && product.variants.length > 0 && !selectedVariant) ? '👉 Select a variant first' :
                                            (selectedVariant ? selectedVariant.stock === 0 : product.stock_quantity === 0) ? '❌ Out of Stock' :
                                                '🛒 Add to Cart'}
                                </button>
                                <button
                                    onClick={handleToggleWishlist}
                                    className={`px-7 py-5 rounded-2xl font-bold text-2xl transition-all transform hover:scale-110 shadow-xl ${isInWishlist
                                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600'
                                        : 'bg-white text-gray-400 border-2 border-gray-300 hover:border-pink-400 hover:text-pink-500'
                                        }`}
                                    title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                                >
                                    {isInWishlist ? '❤️' : '🤍'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
