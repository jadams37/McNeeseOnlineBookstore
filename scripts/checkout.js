// Checkout Modal Functionality
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('checkout-modal');
    const closeBtn = document.querySelector('.close-modal');
    const cancelBtn = document.getElementById('cancel-checkout');
    const checkoutForm = document.getElementById('checkout-form');
    const sameAsBilling = document.getElementById('same-as-billing');
    const shippingFields = document.getElementById('shipping-fields');

    // Open modal - using event delegation since button is dynamically created
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('checkout-btn')) {
            modal.style.display = 'flex';
        }
    });

    // Close modal
    const closeModal = () => {
        modal.style.display = 'none';
        checkoutForm.reset();
        shippingFields.style.display = 'none';
        sameAsBilling.checked = true;
    };

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Toggle shipping fields
    if (sameAsBilling) {
        sameAsBilling.addEventListener('change', () => {
            if (sameAsBilling.checked) {
                shippingFields.style.display = 'none';
                // Clear shipping field required attributes
                const shippingInputs = shippingFields.querySelectorAll('input');
                shippingInputs.forEach(input => input.removeAttribute('required'));
            } else {
                shippingFields.style.display = 'block';
                // Add required attributes to shipping fields
                const shippingInputs = shippingFields.querySelectorAll('input');
                shippingInputs.forEach(input => input.setAttribute('required', 'required'));
            }
        });
    }

    // Format card number input (add spaces every 4 digits)
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }

    // Format expiry input (add slash after MM)
    const expiryInput = document.getElementById('card-expiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }

    // Handle form submission
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(checkoutForm);
            const data = {};

            formData.forEach((value, key) => {
                data[key] = value;
            });

            // If same as billing is checked, use billing info for shipping
            if (sameAsBilling.checked) {
                data.shippingName = data.billingName;
                data.shippingAddress = data.billingAddress;
                data.shippingCity = data.billingCity;
                data.shippingState = data.billingState;
                data.shippingZip = data.billingZip;
            }

            // Remove spaces from card number
            data.cardNumber = data.cardNumber.replace(/\s/g, '');

            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    alert('Please log in to complete your order.');
                    window.location.href = 'login.html';
                    return;
                }

                const response = await fetch('http://localhost:3000/checkout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    alert(`Order placed successfully! Order ID: ${result.orderId}\nA confirmation has been sent for review.`);
                    closeModal();
                    // Reload cart to show it's empty
                    if (typeof loadCart === 'function') {
                        loadCart();
                    }
                } else {
                    alert(`Error: ${result.message || 'Unable to process order'}`);
                }
            } catch (error) {
                console.error('Checkout error:', error);
                alert('An error occurred while processing your order. Please try again.');
            }
        });
    }
});
