'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { cartStore } from '@/lib/cart';
import { wishlistStore } from '@/lib/wishlist';
import { categoriesAPI, buildCategoryTree } from '@/lib/api';

export default function Header() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [activeCategoryDropdown, setActiveCategoryDropdown] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);

    // Fetch categories
    const { data: categoriesData } = useQuery({
        queryKey: ['categories'],
        queryFn: () => categoriesAPI.getAll(),
    });

    // Build hierarchical category tree
    const categoryTree = useMemo(() => {
        return buildCategoryTree(categoriesData);
    }, [categoriesData]);

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
        <header className="glass sticky top-0 z-50 shadow-xl backdrop-blur-lg border-b border-white/20">
            {/* Top Row - Logo and Actions */}
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    <Link href="/" className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-pink-700 transition transform hover:scale-105">
                        🛍️ Unique Style Zone
                    </Link>

                    {/* Right side actions */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link href="/wishlist" className="relative group" title="Wishlist">
                            <div className="p-2 hover:bg-pink-50 rounded-xl transition">
                                <svg
                                    className="w-7 h-7 text-gray-700 group-hover:text-pink-600 transition"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                </svg>
                                {wishlistCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-bold rounded-full min-w-6 h-6 flex items-center justify-center px-1 shadow-lg animate-pulse-once">
                                        {wishlistCount > 99 ? '99+' : wishlistCount}
                                    </span>
                                )}
                            </div>
                        </Link>

                        <Link href="/cart" className="relative group">
                            <div className="p-2 hover:bg-purple-50 rounded-xl transition">
                                <svg
                                    className="w-7 h-7 text-gray-700 group-hover:text-purple-600 transition"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full min-w-6 h-6 flex items-center justify-center px-1 shadow-lg animate-pulse-once">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </div>
                        </Link>

                        {isLoggedIn ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-purple-50 transition-all border-2 border-transparent hover:border-purple-200"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        👤
                                    </div>
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {showMenu && (
                                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border-2 border-purple-100 py-2 z-50 animate-fadeIn">
                                        <Link
                                            href="/profile"
                                            className="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-purple-50 transition rounded-xl mx-2"
                                            onClick={() => setShowMenu(false)}
                                        >
                                            <span className="text-xl">👤</span>
                                            <span className="font-semibold">Profile</span>
                                        </Link>
                                        <Link
                                            href="/orders"
                                            className="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-purple-50 transition rounded-xl mx-2"
                                            onClick={() => setShowMenu(false)}
                                        >
                                            <span className="text-xl">📦</span>
                                            <span className="font-semibold">My Orders</span>
                                        </Link>
                                        <div className="border-t border-gray-200 my-2 mx-2"></div>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 w-full text-left px-5 py-3 text-red-600 hover:bg-red-50 transition rounded-xl mx-2 font-semibold"
                                        >
                                            <span className="text-xl">🚪</span>
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-full font-bold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
                            >
                                Login
                            </Link>
                        )}
                    </div>

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
            </div>

            {/* Category Navigation Bar - Desktop */}
            <nav className="hidden md:block bg-gradient-to-r from-purple-600 to-pink-600">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-center space-x-1">
                        {/* Home Link */}
                        <Link 
                            href="/" 
                            className="px-4 py-3 text-white font-semibold hover:bg-white/20 transition-all rounded-lg"
                        >
                            Home
                        </Link>
                        
                        {/* All Products Link */}
                        <Link 
                            href="/products" 
                            className="px-4 py-3 text-white font-semibold hover:bg-white/20 transition-all rounded-lg"
                        >
                            All Products
                        </Link>

                        {/* Category Links */}
                        {categoryTree.map((category) => (
                            <div
                                key={category.id}
                                className="relative"
                                onMouseEnter={() => setActiveCategoryDropdown(category.id)}
                                onMouseLeave={() => setActiveCategoryDropdown(null)}
                            >
                                <Link
                                    href={`/products?category=${category.id}`}
                                    className="flex items-center gap-1 px-4 py-3 text-white font-semibold hover:bg-white/20 transition-all rounded-lg"
                                >
                                    {category.name}
                                    {category.subCategories && category.subCategories.length > 0 && (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    )}
                                </Link>

                                {/* Subcategories Dropdown */}
                                {category.subCategories && category.subCategories.length > 0 && activeCategoryDropdown === category.id && (
                                    <div className="absolute left-0 top-full mt-0 w-56 bg-white rounded-b-xl shadow-2xl border border-purple-100 py-2 z-50 animate-fadeIn">
                                        {/* Link to view all in this category */}
                                        <Link
                                            href={`/products?category=${category.id}`}
                                            className="block px-4 py-2 text-purple-600 hover:bg-purple-50 transition font-semibold border-b border-gray-100"
                                            onClick={() => setActiveCategoryDropdown(null)}
                                        >
                                            All {category.name}
                                        </Link>
                                        {category.subCategories.map((subCategory) => (
                                            <Link
                                                key={subCategory.id}
                                                href={`/products?category=${subCategory.id}`}
                                                className="block px-4 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition"
                                                onClick={() => setActiveCategoryDropdown(null)}
                                            >
                                                {subCategory.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Mobile menu */}
            {showMenu && (
                <div className="md:hidden border-t bg-white">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex flex-col space-y-1">
                            <Link 
                                href="/" 
                                className="text-gray-700 hover:text-purple-600 hover:bg-purple-50 py-3 px-4 rounded-lg font-medium" 
                                onClick={() => setShowMenu(false)}
                            >
                                🏠 Home
                            </Link>
                            <Link 
                                href="/products" 
                                className="text-gray-700 hover:text-purple-600 hover:bg-purple-50 py-3 px-4 rounded-lg font-medium" 
                                onClick={() => setShowMenu(false)}
                            >
                                🛍️ All Products
                            </Link>
                            
                            {/* Mobile Categories */}
                            {categoryTree.length > 0 && (
                                <div className="border-t border-gray-100 pt-2 mt-2">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-2">
                                        Categories
                                    </div>
                                    {categoryTree.map((category) => (
                                        <div key={category.id}>
                                            <Link 
                                                href={`/products?category=${category.id}`}
                                                className="block text-gray-700 hover:text-purple-600 hover:bg-purple-50 py-3 px-4 rounded-lg font-medium"
                                                onClick={() => setShowMenu(false)}
                                            >
                                                {category.name}
                                            </Link>
                                            {category.subCategories && category.subCategories.length > 0 && (
                                                <div className="ml-4 border-l-2 border-purple-200">
                                                    {category.subCategories.map((subCat) => (
                                                        <Link 
                                                            key={subCat.id}
                                                            href={`/products?category=${subCat.id}`}
                                                            className="block text-gray-500 hover:text-purple-600 hover:bg-purple-50 py-2 px-4 text-sm"
                                                            onClick={() => setShowMenu(false)}
                                                        >
                                                            {subCat.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {/* Account & Actions */}
                            <div className="border-t border-gray-100 pt-2 mt-2">
                                <Link 
                                    href="/wishlist" 
                                    className="text-gray-700 hover:text-purple-600 hover:bg-purple-50 py-3 px-4 rounded-lg flex items-center justify-between" 
                                    onClick={() => setShowMenu(false)}
                                >
                                    <span className="flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                        Wishlist
                                    </span>
                                    {wishlistCount > 0 && (
                                        <span className="bg-pink-500 text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-2">
                                            {wishlistCount > 99 ? '99+' : wishlistCount}
                                        </span>
                                    )}
                                </Link>
                                <Link 
                                    href="/cart" 
                                    className="text-gray-700 hover:text-purple-600 hover:bg-purple-50 py-3 px-4 rounded-lg flex items-center justify-between" 
                                    onClick={() => setShowMenu(false)}
                                >
                                    <span className="flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Cart
                                    </span>
                                    {cartCount > 0 && (
                                        <span className="bg-purple-500 text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-2">
                                            {cartCount > 99 ? '99+' : cartCount}
                                        </span>
                                    )}
                                </Link>
                            </div>
                            
                            {/* Auth Section */}
                            <div className="border-t border-gray-100 pt-2 mt-2">
                                {isLoggedIn ? (
                                    <>
                                        <Link 
                                            href="/profile" 
                                            className="block text-gray-700 hover:text-purple-600 hover:bg-purple-50 py-3 px-4 rounded-lg" 
                                            onClick={() => setShowMenu(false)}
                                        >
                                            👤 Profile
                                        </Link>
                                        <Link 
                                            href="/orders" 
                                            className="block text-gray-700 hover:text-purple-600 hover:bg-purple-50 py-3 px-4 rounded-lg" 
                                            onClick={() => setShowMenu(false)}
                                        >
                                            📦 My Orders
                                        </Link>
                                        <button 
                                            onClick={handleLogout} 
                                            className="w-full text-left text-red-600 hover:bg-red-50 py-3 px-4 rounded-lg"
                                        >
                                            🚪 Logout
                                        </button>
                                    </>
                                ) : (
                                    <Link 
                                        href="/login" 
                                        className="block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold text-center mt-2" 
                                        onClick={() => setShowMenu(false)}
                                    >
                                        Login / Register
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
