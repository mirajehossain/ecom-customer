'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { productsAPI } from '@/lib/api';
import { cartStore } from '@/lib/cart';
import { wishlistStore } from '@/lib/wishlist';
import Header from '@/app/components/Header';
import { useState, useEffect } from 'react';

export default function ProductDetailPage() {
    const { id } = useParams();
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [isInWishlist, setIsInWishlist] = useState(false);

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
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Product Detail */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Image */}
                    <div>
                        {product.image ? (
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-auto rounded-lg shadow-lg"
                            />
                        ) : (
                            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400 text-xl">No Image</span>
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">{product.name}</h1>

                        <div className="mb-6">
                            <span className="text-3xl font-bold text-blue-600">
                                ${parseFloat(product.price).toFixed(2)}
                            </span>
                            {product.compare_price && (
                                <span className="text-xl text-gray-400 line-through ml-4">
                                    ${parseFloat(product.compare_price).toFixed(2)}
                                </span>
                            )}
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-700 leading-relaxed">{product.description}</p>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-gray-600 mb-2">SKU: {product.sku || 'N/A'}</p>
                            <p className="text-sm text-gray-600">
                                Stock: <span className={product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                                    {product.stock_quantity} available
                                </span>
                            </p>
                        </div>

                        {/* Variants */}
                        {product.variants && Array.isArray(product.variants) && product.variants.length > 0 && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Variant
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {product.variants.map((variant) => (
                                        <button
                                            key={variant.id}
                                            onClick={() => setSelectedVariant(variant)}
                                            className={`px-4 py-2 border rounded-lg text-sm font-medium transition ${selectedVariant?.id === variant.id
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                                                }`}
                                        >
                                            <div>{variant.name || 'Default'}</div>
                                            {variant.price && (
                                                <div className="text-xs mt-1">
                                                    ${parseFloat(variant.price).toFixed(2)}
                                                </div>
                                            )}
                                            {variant.stock !== undefined && (
                                                <div className={`text-xs mt-1 ${variant.stock > 0 ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {variant.stock > 0 ? `${variant.stock} in stock` : 'Out of stock'}
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity and Add to Cart */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quantity
                            </label>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="px-4 py-2 border rounded hover:bg-gray-100"
                                    disabled={quantity <= 1}
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-20 px-3 py-2 border rounded text-center"
                                    min="1"
                                    max={selectedVariant?.stock !== undefined ? selectedVariant.stock : product.stock_quantity}
                                />
                                <button
                                    onClick={() => setQuantity(Math.min(
                                        selectedVariant?.stock !== undefined ? selectedVariant.stock : product.stock_quantity,
                                        quantity + 1
                                    ))}
                                    className="px-4 py-2 border rounded hover:bg-gray-100"
                                    disabled={quantity >= (selectedVariant?.stock !== undefined ? selectedVariant.stock : product.stock_quantity)}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleAddToCart}
                                disabled={
                                    addedToCart ||
                                    (product.variants && Array.isArray(product.variants) && product.variants.length > 0 && !selectedVariant) ||
                                    (selectedVariant ? selectedVariant.stock === 0 : product.stock_quantity === 0)
                                }
                                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                            >
                                {addedToCart ? 'Added to Cart!' :
                                    (product.variants && Array.isArray(product.variants) && product.variants.length > 0 && !selectedVariant) ? 'Select a variant' :
                                        (selectedVariant ? selectedVariant.stock === 0 : product.stock_quantity === 0) ? 'Out of Stock' :
                                            'Add to Cart'}
                            </button>
                            <button
                                onClick={handleToggleWishlist}
                                className={`px-6 py-3 rounded-lg font-semibold transition ${isInWishlist
                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
    );
}
