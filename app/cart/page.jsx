'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';
import { cartStore } from '@/lib/cart';
import { ordersAPI } from '@/lib/api';

export default function CartPage() {
    const router = useRouter();
    const [cartItems, setCartItems] = useState([]);
    const [showCheckout, setShowCheckout] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [shippingInfo, setShippingInfo] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
    });

    useEffect(() => {
        const updateCartItems = () => {
            setCartItems(cartStore.get());
        };

        // Load initial cart
        updateCartItems();

        // Listen to cart changes
        window.addEventListener('cart-changed', updateCartItems);

        return () => {
            window.removeEventListener('cart-changed', updateCartItems);
        };
    }, []);

    const removeFromCart = (id) => {
        const newItems = cartStore.remove(id);
        setCartItems(newItems);
    };

    const updateQuantity = (id, quantity) => {
        if (quantity <= 0) {
            removeFromCart(id);
        } else {
            const newItems = cartStore.update(id, quantity);
            setCartItems(newItems);
        }
    };

    const total = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

    const handleOpenCheckout = () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }
        setShowCheckout(true);
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Check if user is logged in
        const token = localStorage.getItem('access_token');
        if (!token) {
            setError('Please log in to continue checkout');
            setLoading(false);
            setShowCheckout(false);
            router.push('/login');
            return;
        }

        try {
            const cartItemsData = cartItems.map(item => ({
                product_id: item.product_id || item.id,
                variant_id: 0,
                quantity: item.quantity,
            }));

            const orderData = {
                cart_items: cartItemsData,
                shipping_address: shippingInfo,
                notes: '',
            };

            const response = await ordersAPI.create(orderData);
            cartStore.clear();
            // Handle different response formats
            const orderId = response?.data?.id || response?.id || response?.order?.id;
            if (orderId) {
                router.push(`/orders/${orderId}`);
            } else {
                router.push('/orders');
            }
        } catch (err) {
            console.error('Checkout error:', err);
            // Don't show error if user is being redirected to login (401)
            if (err.response?.status === 401) {
                setLoading(false);
                setShowCheckout(false);
                return;
            }
            const errorMessage = err.response?.data?.error || err.message || 'Failed to create order. Please try again.';
            setError(errorMessage);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="container mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

                {cartItems.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
                        <Link
                            href="/products"
                            className="text-blue-600 hover:underline"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="p-6 border-b last:border-b-0">
                                        <div className="flex items-center space-x-4">
                                            {item.image && (
                                                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                                            )}
                                            {!item.image && (
                                                <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                                                    <span className="text-gray-400 text-xs">No Image</span>
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <h3 className="font-semibold">{item.name}</h3>
                                                <p className="text-blue-600 font-bold text-lg mb-2">
                                                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                                                </p>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-100"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-12 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-100"
                                                    >
                                                        +
                                                    </button>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="ml-4 text-red-600 hover:text-red-700"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Shipping</span>
                                        <span>Free</span>
                                    </div>
                                    <div className="border-t pt-3">
                                        <div className="flex justify-between font-bold text-xl">
                                            <span>Total</span>
                                            <span>${total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleOpenCheckout}
                                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Checkout Modal */}
            {showCheckout && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">Checkout</h2>
                                <button
                                    onClick={() => setShowCheckout(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {error && (
                                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleCheckout} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">First Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={shippingInfo.first_name}
                                            onChange={(e) => setShippingInfo({ ...shippingInfo, first_name: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Last Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={shippingInfo.last_name}
                                            onChange={(e) => setShippingInfo({ ...shippingInfo, last_name: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Email *</label>
                                    <input
                                        type="email"
                                        required
                                        value={shippingInfo.email}
                                        onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Phone *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={shippingInfo.phone}
                                        onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Address *</label>
                                    <input
                                        type="text"
                                        required
                                        value={shippingInfo.address}
                                        onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">City *</label>
                                        <input
                                            type="text"
                                            required
                                            value={shippingInfo.city}
                                            onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">State *</label>
                                        <input
                                            type="text"
                                            required
                                            value={shippingInfo.state}
                                            onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Postal Code *</label>
                                        <input
                                            type="text"
                                            required
                                            value={shippingInfo.postal_code}
                                            onChange={(e) => setShippingInfo({ ...shippingInfo, postal_code: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Country *</label>
                                        <input
                                            type="text"
                                            required
                                            value={shippingInfo.country}
                                            onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCheckout(false)}
                                        className="flex-1 px-6 py-3 border rounded-lg font-semibold hover:bg-gray-100 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
                                    >
                                        {loading ? 'Processing...' : 'Complete Order'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
