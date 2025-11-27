'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Header from '@/app/components/Header';
import Link from 'next/link';
import { ordersAPI } from '@/lib/api';

export default function OrderDetailPage() {
    const { id } = useParams();
    const { data, isLoading, error } = useQuery({
        queryKey: ['order', id],
        queryFn: () => ordersAPI.getById(id),
    });

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            window.location.href = '/login';
        }
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="container mx-auto px-4 py-12">
                    <div className="text-center text-xl">Loading...</div>
                </div>
            </div>
        );
    }

    if (!data || error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="container mx-auto px-4 py-12">
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Order #{id}</h2>
                        <p className="text-gray-600 mb-8">Order not found</p>
                        <Link
                            href="/orders"
                            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                            ← Back to Orders
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="container mx-auto px-4 py-12">
                <Link href="/orders" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
                    ← Back to Orders
                </Link>

                <h1 className="text-3xl font-bold mb-8">Order #{data.order.order_number}</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h2 className="text-xl font-bold mb-4">Order Items</h2>
                            {data?.items && data.items.length > 0 ? (
                                <div className="space-y-4">
                                    {data.items.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between border-b pb-4">
                                            <div className="flex items-center space-x-4">
                                                <div>
                                                    <p className="font-semibold">Product ID: {item.product_id}</p>
                                                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold">${parseFloat(item.price).toFixed(2)}</p>
                                                <p className="text-sm text-gray-600">Total: ${parseFloat(item.total).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600">No items found</p>
                            )}
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
                            {(() => {
                                try {
                                    const address = JSON.parse(data.order.shipping_address);
                                    return (
                                        <div className="text-gray-700">
                                            <p className="font-semibold">{address.first_name} {address.last_name}</p>
                                            <p>{address.address}</p>
                                            <p>{address.city}, {address.state} {address.postal_code}</p>
                                            <p>{address.country}</p>
                                            <p className="mt-2"><strong>Email:</strong> {address.email}</p>
                                            <p><strong>Phone:</strong> {address.phone}</p>
                                        </div>
                                    );
                                } catch (e) {
                                    return <p className="text-gray-600">Address information unavailable</p>;
                                }
                            })()}
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-semibold">${parseFloat(data.order.subtotal).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="font-semibold">${parseFloat(data.order.tax).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-semibold">${parseFloat(data.order.shipping).toFixed(2)}</span>
                                </div>
                                <div className="border-t pt-3">
                                    <div className="flex justify-between text-xl font-bold">
                                        <span>Total</span>
                                        <span>${parseFloat(data.order.total).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t">
                                <p className="text-sm text-gray-600 mb-2">Status</p>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${data.order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    data.order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-blue-100 text-blue-800'
                                    }`}>
                                    {data.order.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
