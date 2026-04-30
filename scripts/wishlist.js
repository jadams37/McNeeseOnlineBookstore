// Wishlist utility functions
const wishlistAPI = {
    async getWishlist() {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Not authenticated');
        }

        const response = await fetch('/wishlist', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to load wishlist');
        }

        return response.json();
    },

    async addToWishlist(productId) {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Please log in to add items to your wishlist');
        }

        const response = await fetch('/wishlist/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to add item to wishlist');
        }

        return data;
    },

    async removeFromWishlist(productId) {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(`/wishlist/items/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to remove item from wishlist');
        }

        return data;
    },

    async isInWishlist(productId) {
        try {
            const { wishlist } = await this.getWishlist();
            return wishlist.some(item => item.product_id === productId);
        } catch (error) {
            return false;
        }
    }
};

// Toggle wishlist for a product
async function toggleWishlist(productId, heartElement) {
    try {
        const isInWishlist = heartElement.classList.contains('in-wishlist');

        if (isInWishlist) {
            await wishlistAPI.removeFromWishlist(productId);
            heartElement.classList.remove('in-wishlist');
            heartElement.textContent = '♡'; // Empty heart
        } else {
            await wishlistAPI.addToWishlist(productId);
            heartElement.classList.add('in-wishlist');
            heartElement.textContent = '♥'; // Filled heart
        }
    } catch (error) {
        alert(error.message || 'Unable to update wishlist');
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { wishlistAPI, toggleWishlist };
}
