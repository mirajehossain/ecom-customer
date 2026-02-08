'use client';

// Simple in-memory cart store for frontend-only cart functionality
let cartItems = [];

// Helper function to emit cart change events
const emitCartChange = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cart-changed'));
    }
};

export const cartStore = {
    get: () => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('cart');
            return stored ? JSON.parse(stored) : [];
        }
        return [];
    },

    add: (product) => {
        const items = cartStore.get();
        const existingItem = items.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            items.push({
                id: product.id,
                product_id: product.id,
                name: product.name,
                price: product.price,
                image: product.images?.find((i) => i.is_primary)?.image_url || product.images?.[0]?.image_url || product.image,
                quantity: 1,
            });
        }

        if (typeof window !== 'undefined') {
            localStorage.setItem('cart', JSON.stringify(items));
            emitCartChange();
        }
        return items;
    },

    remove: (id) => {
        const items = cartStore.get().filter(item => item.id !== id);
        if (typeof window !== 'undefined') {
            localStorage.setItem('cart', JSON.stringify(items));
            emitCartChange();
        }
        return items;
    },

    update: (id, quantity) => {
        const items = cartStore.get();
        const item = items.find(item => item.id === id);
        if (item) {
            item.quantity = quantity;
            if (typeof window !== 'undefined') {
                localStorage.setItem('cart', JSON.stringify(items));
                emitCartChange();
            }
        }
        return items;
    },

    clear: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('cart');
            emitCartChange();
        }
    },
};
