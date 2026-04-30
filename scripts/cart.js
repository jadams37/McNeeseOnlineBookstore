window.addEventListener('DOMContentLoaded', async () => {
    const cartItemsEl = document.getElementById('cart-items');
    const cartSummaryEl = document.getElementById('cart-summary');

    if (!cartItemsEl || !cartSummaryEl) {
        return;
    }

    const loadCart = async () => {
        const token = localStorage.getItem('authToken');

        if (!token) {
            cartItemsEl.innerHTML = '<p>Please log in to view your cart.</p>';
            cartSummaryEl.innerHTML = '';
            return;
        }

        try {
            const response = await fetch('/cart', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    cartItemsEl.innerHTML = '<p>Please log in to view your cart.</p>';
                    return;
                }
                throw new Error(data.message || 'Unable to load cart.');
            }

            const { cart } = data;

            if (!cart.items.length) {
                cartItemsEl.innerHTML = '<p>Your cart is empty.</p>';
                cartSummaryEl.innerHTML = '';
                return;
            }

            cartItemsEl.innerHTML = cart.items.map(item => {
                const itemImagePath = item.image_path || 'images/placeholder.jpg';
                return `
                    <div class="cart-item" data-item-id="${item.cart_item_id}">
                        <img src="${itemImagePath}" alt="${item.title}" class="cart-item-image">
                        <div class="item-details">
                            <h3>${item.title}</h3>
                            <p>Author: ${item.author || 'N/A'}</p>
                            <p>Price: $${Number(item.price).toFixed(2)}</p>
                            <p>Stock: ${item.quantity_in_stock}</p>
                        </div>
                        <div class="item-controls">
                            <button class="quantity-btn" onclick="changeQuantity('${item.cart_item_id}', -1)">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn" onclick="changeQuantity('${item.cart_item_id}', 1)">+</button>
                            <button class="remove-btn" onclick="removeItem('${item.cart_item_id}')">Remove</button>
                        </div>
                        <div class="item-total">
                            <p>Total: $${Number(item.line_total).toFixed(2)}</p>
                        </div>
                    </div>
                `;
            }).join('');

            cartSummaryEl.innerHTML = `
                <h3>Order Summary</h3>
                <p>Subtotal: $${cart.subtotal}</p>
                <p>Tax: $${cart.tax_amount}</p>
                <p><strong>Total: $${cart.total}</strong></p>
                <button class="checkout-btn">Proceed to Checkout</button>
            `;
        } catch (error) {
            cartItemsEl.innerHTML = `<p>${error.message || 'Unable to load cart right now.'}</p>`;
        }
    };

    window.changeQuantity = async (itemId, delta) => {
        const itemEl = document.querySelector(`[data-item-id="${itemId}"]`);
        if (!itemEl) {
            return;
        }

        const quantityEl = itemEl.querySelector('.quantity');
        if (!quantityEl) {
            return;
        }

        const currentQty = parseInt(quantityEl.textContent, 10);
        const newQty = currentQty + delta;

        if (newQty < 0) return;

        try {
            const response = await fetch(`/cart/items/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ quantity: newQty })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Unable to update item.');
            }

            await loadCart(); // Reload cart
        } catch (error) {
            alert(error.message || 'Unable to update item right now.');
        }
    };

    window.removeItem = async (itemId) => {
        if (!confirm('Remove this item from cart?')) return;

        try {
            const response = await fetch(`/cart/items/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Unable to remove item.');
            }

            await loadCart(); // Reload cart
        } catch (error) {
            alert(error.message || 'Unable to remove item right now.');
        }
    };

    // Initial load
    await loadCart();
});