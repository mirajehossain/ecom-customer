'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import { wishlistStore } from '@/lib/wishlist';
import { cartStore } from '@/lib/cart';

export default function WishlistPage() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        setItems(wishlistStore.getState().items);
        const unsubscribe = wishlistStore.subscribe((state) => {
            setItems(state.items);
        });
        return unsubscribe;
    }, []);

    const handleRemove = (productId) => {
        wishlistStore.getState().remove(productId);
    };

    const handleAddToCart = (product) => {
        cartStore.add(product);
        alert('Added to cart!');
    };

    const handleMoveToCart = (product) => {
        cartStore.add(product);
        wishlistStore.getState().remove(product.id);
        alert('Moved to cart!');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="container mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">My Wishlist</h1>

                {items.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <div className="text-6xl mb-4">💝</div>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your wishlist is empty</h2>
                        <p className="text-gray-600 mb-8">Start adding products you love!</p>
                        <Link
                            href="/products"
                            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div>
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                {items.map((item) => (
                                    <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
                                        <Link href={`/products/${item.id}`}>
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-48 object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                                                    <span className="text-gray-400">No Image</span>
                                                </div>
                                            )}
                                        </Link>

                                        <div className="p-4">
                                            <Link href={`/products/${item.id}`}>
                                                <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-blue-600 line-clamp-2">
                                                    {item.name}
                                                </h3>
                                            </Link>

                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-xl font-bold text-blue-600">
                                                    ${parseFloat(item.price).toFixed(2)}
                                                </span>
                                                {item.stock_quantity > 0 ? (
                                                    <span className="text-sm text-green-600 font-medium">In Stock</span>
                                                ) : (
                                                    <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <button
                                                    onClick={() => handleMoveToCart(item)}
                                                    disabled={item.stock_quantity === 0}
                                                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                                                >
                                                    Move to Cart
                                                </button>
                                                <button
                                                    onClick={() => handleRemove(item.id)}
                                                    className="w-full bg-red-50 text-red-600 py-2 rounded-lg font-semibold hover:bg-red-100 transition"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-gray-600">Total Items</p>
                                    <p className="text-2xl font-bold text-gray-800">{items.length}</p>
                                </div>
                                <div className="space-x-4">
                                    <button
                                        onClick={() => {
                                            if (confirm('Are you sure you want to clear your wishlist?')) {
                                                wishlistStore.getState().clear();
                                            }
                                        }}
                                        className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
                                    >
                                        Clear Wishlist
                                    </button>
                                    <Link
                                        href="/products"
                                        className="inline-block px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                                    >
                                        Continue Shopping
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

