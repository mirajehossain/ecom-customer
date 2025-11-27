'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Header from '../components/Header';
import Link from 'next/link';
import { authAPI } from '@/lib/api';

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
    });

    const { data: userData, isLoading, refetch } = useQuery({
        queryKey: ['user-profile'],
        queryFn: async () => {
            const response = await authAPI.getMe();
            return response.data;
        },
    });

    useEffect(() => {
        if (userData?.data) {
            setFormData({
                name: userData.data.name || '',
                email: userData.data.email || '',
                phone: userData.data.phone || '',
                address: userData.data.address || '',
            });
        }
    }, [userData]);

    const updateProfileMutation = useMutation({
        mutationFn: async (data) => {
            const response = await authAPI.updateProfile(data);
            return response.data;
        },
        onSuccess: () => {
            alert('Profile updated successfully!');
            setIsEditing(false);
            refetch();
        },
        onError: (error) => {
            alert(error.response?.data?.error || 'Failed to update profile');
        },
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateProfileMutation.mutate(formData);
    };

    const handleCancel = () => {
        if (userData?.data) {
            setFormData({
                name: userData.data.name || '',
                email: userData.data.email || '',
                phone: userData.data.phone || '',
                address: userData.data.address || '',
            });
        }
        setIsEditing(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    const user = userData?.data;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="container mx-auto px-4 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">My Profile</h1>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl">
                    <div className="mb-8">
                        <div className="flex items-center space-x-6 mb-6">
                            <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                                {(user?.name || user?.email)?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {user?.name || 'Account Information'}
                                </h2>
                                <p className="text-gray-600">{user?.email}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Role: <span className="font-medium">{user?.role || 'customer'}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={true}
                                className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                                placeholder="Email cannot be changed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                placeholder="Enter your phone number"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                rows={3}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                placeholder="Enter your address"
                            />
                        </div>

                        {isEditing && (
                            <div className="flex space-x-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={updateProfileMutation.isLoading}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </form>

                    <div className="mt-8 pt-8 border-t">
                        <Link
                            href="/orders"
                            className="block bg-blue-50 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-100 transition text-center"
                        >
                            View My Orders →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
