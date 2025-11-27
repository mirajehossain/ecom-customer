'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cartStore } from '@/lib/cart';
import { wishlistStore } from '@/lib/wishlist';

export default function Header() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        setIsLoggedIn(!!token);

        // Load initial cart count
        const updateCartCount = () => {
            const items = cartStore.get();
            const total = items.reduce((sum, item) => sum + item.quantity, 0);
            setCartCount(total);
        };
        updateCartCount();

        // Load initial wishlist count
        const updateWishlistCount = () => {
            setWishlistCount(wishlistStore.getState().getCount());
        };
        updateWishlistCount();

        // Listen to cart changes
        window.addEventListener('cart-changed', updateCartCount);

        // Listen to wishlist changes
        const unsubscribeWishlist = wishlistStore.subscribe(() => {
            updateWishlistCount();
        });

        return () => {
            window.removeEventListener('cart-changed', updateCartCount);
            unsubscribeWishlist();
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('cart');
        setIsLoggedIn(false);
        router.push('/');
    };

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
                        🛍️ E-Commerce
                    </Link>

                    <nav className="hidden md:flex items-center space-x-6">
                        <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition">
                            Home
                        </Link>
                        <Link href="/products" className="text-gray-700 hover:text-blue-600 font-medium transition">
                            Products
                        </Link>
                        <Link href="/wishlist" className="relative text-gray-700 hover:text-blue-600 font-medium transition" title="Wishlist">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {wishlistCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1">
                                    {wishlistCount > 99 ? '99+' : wishlistCount}
                                </span>
                            )}
                        </Link>
                        <Link href="/cart" className="relative text-gray-700 hover:text-blue-600 font-medium transition">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </Link>

                        {isLoggedIn ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                                >
                                    <span className="text-gray-700 font-medium">Account</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {showMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
                                        <Link
                                            href="/profile"
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                            onClick={() => setShowMenu(false)}
                                        >
                                            👤 Profile
                                        </Link>
                                        <Link
                                            href="/orders"
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                            onClick={() => setShowMenu(false)}
                                        >
                                            📦 My Orders
                                        </Link>
                                        <div className="border-t my-1"></div>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                                        >
                                            🚪 Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                            >
                                Login
                            </Link>
                        )}
                    </nav>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden text-gray-700"
                        onClick={() => setShowMenu(!showMenu)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                {/* Mobile menu */}
                {showMenu && (
                    <div className="md:hidden mt-4 pt-4 border-t">
                        <div className="flex flex-col space-y-2">
                            <Link href="/" className="text-gray-700 hover:text-blue-600 py-2">Home</Link>
                            <Link href="/products" className="text-gray-700 hover:text-blue-600 py-2">Products</Link>
                            <Link href="/wishlist" className="relative text-gray-700 hover:text-blue-600 py-2 flex items-center">
                                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span>Wishlist</span>
                                {wishlistCount > 0 && (
                                    <span className="ml-2 bg-pink-500 text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1">
                                        {wishlistCount > 99 ? '99+' : wishlistCount}
                                    </span>
                                )}
                            </Link>
                            <Link href="/cart" className="relative text-gray-700 hover:text-blue-600 py-2 flex items-center">
                                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span>Cart</span>
                                {cartCount > 0 && (
                                    <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </Link>
                            {isLoggedIn ? (
                                <>
                                    <Link href="/profile" className="text-gray-700 hover:text-blue-600 py-2" onClick={() => setShowMenu(false)}>👤 Profile</Link>
                                    <Link href="/orders" className="text-gray-700 hover:text-blue-600 py-2" onClick={() => setShowMenu(false)}>📦 My Orders</Link>
                                    <button onClick={handleLogout} className="text-left text-red-600 py-2">Logout</button>
                                </>
                            ) : (
                                <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold text-center">
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
