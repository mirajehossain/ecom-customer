import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const wishlistStore = create(
    persist(
        (set, get) => ({
            items: [],

            // Add item to wishlist
            add: (product) => {
                const items = get().items;
                const exists = items.find((item) => item.id === product.id);

                if (exists) {
                    return; // Already in wishlist
                }

                set({ items: [...items, product] });
            },

            // Remove item from wishlist
            remove: (productId) => {
                const items = get().items;
                set({ items: items.filter((item) => item.id !== productId) });
            },

            // Check if product is in wishlist
            isInWishlist: (productId) => {
                const items = get().items;
                return items.some((item) => item.id === productId);
            },

            // Clear entire wishlist
            clear: () => {
                set({ items: [] });
            },

            // Get count of items
            getCount: () => {
                return get().items.length;
            },
        }),
        {
            name: 'wishlist-storage',
        }
    )
);

