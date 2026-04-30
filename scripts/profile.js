window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    const firstNameInput = document.getElementById('first-name');
    const lastNameInput = document.getElementById('last-name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone-number');
    const addressInput = document.getElementById('physical-address');
    const saveButton = document.getElementById('save-profile');
    const messageNode = document.getElementById('profile-message');
    const userNameNode = document.querySelector('.user-name');
    const userEmailNode = document.querySelector('.user-email');

    const renderMessage = (message, isError = false) => {
        if (!messageNode) {
            return;
        }

        messageNode.textContent = message;
        messageNode.style.color = isError ? '#b00020' : '#0b6d30';
    };

    if (!token) {
        renderMessage('Please log in to access your profile.', true);
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
        return;
    }

    const authHeaders = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    const syncProfileCard = (profile) => {
        const firstName = profile.first_name || '';
        const lastName = profile.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();

        if (userNameNode) {
            userNameNode.textContent = fullName || profile.username || 'User';
        }

        if (userEmailNode) {
            userEmailNode.textContent = profile.email || '';
        }

        // Update profile picture
        const profileImage = document.getElementById('profile-image');
        if (profileImage && profile.profile_picture_url) {
            profileImage.src = profile.profile_picture_url;
        }
    };

    const loadProfile = async () => {
        try {
            const response = await fetch('/profile/me', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Unable to load profile.');
            }

            const profile = data.profile || {};
            if (firstNameInput) firstNameInput.value = profile.first_name || '';
            if (lastNameInput) lastNameInput.value = profile.last_name || '';
            if (emailInput) emailInput.value = profile.email || '';
            if (phoneInput) phoneInput.value = profile.phone_number || '';
            if (addressInput) addressInput.value = profile.physical_address || '';
            syncProfileCard(profile);
        } catch (error) {
            renderMessage(error.message || 'Unable to load profile.', true);
            if (String(error.message || '').toLowerCase().includes('authentication')) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('authUser');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
            }
        }
    };

    saveButton?.addEventListener('click', async () => {
        const payload = {
            firstName: firstNameInput?.value?.trim(),
            lastName: lastNameInput?.value?.trim(),
            phoneNumber: phoneInput?.value?.trim(),
            physicalAddress: addressInput?.value?.trim()
        };

        if (!payload.firstName || !payload.lastName) {
            renderMessage('First and last name are required.', true);
            return;
        }

        try {
            const response = await fetch('/profile/me', {
                method: 'PUT',
                headers: authHeaders,
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Unable to save profile.');
            }

            if (data.profile) {
                syncProfileCard(data.profile);
            }

            renderMessage('Profile updated successfully.');
        } catch (error) {
            renderMessage(error.message || 'Unable to save profile.', true);
        }
    });

    // Load wishlist
    const loadWishlist = async () => {
        const wishlistContainer = document.getElementById('wishlist-container');
        if (!wishlistContainer) {
            return;
        }

        try {
            const response = await fetch('/wishlist', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Unable to load wishlist');
            }

            const { wishlist } = await response.json();

            if (!wishlist || wishlist.length === 0) {
                wishlistContainer.innerHTML = '<p class="empty-message">Your wishlist is empty.</p>';
                return;
            }

            const wishlistHTML = wishlist.map(item => {
                const price = Number(item.price || 0).toFixed(2);
                const details = [item.author, item.condition, item.category_name]
                    .filter(Boolean)
                    .join(' | ');
                const itemImagePath = item.image_path || 'images/placeholder.jpg';

                return `
                    <div class="wishlist-item">
                        <img src="${itemImagePath}" alt="${item.title}" class="wishlist-item-image">
                        <div class="wishlist-item-info">
                            <h3 class="wishlist-item-title">${item.title || 'Untitled'}</h3>
                            <p class="wishlist-item-detail">${details || 'No details'}</p>
                            <p class="wishlist-item-price">$${price}</p>
                        </div>
                        <div class="wishlist-item-actions">
                            <a href="Product.html?id=${item.product_id}" class="wishlist-view-btn">View</a>
                            <button class="wishlist-remove-btn" data-product-id="${item.product_id}">Remove</button>
                        </div>
                    </div>
                `;
            }).join('');

            wishlistContainer.innerHTML = wishlistHTML;

            // Add event listeners for remove buttons
            wishlistContainer.querySelectorAll('.wishlist-remove-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const productId = e.target.getAttribute('data-product-id');
                    await removeFromWishlist(productId);
                });
            });
        } catch (error) {
            wishlistContainer.innerHTML = '<p class="error-message">Unable to load wishlist.</p>';
        }
    };

    const removeFromWishlist = async (productId) => {
        try {
            const response = await fetch(`/wishlist/items/${productId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Unable to remove item');
            }

            // Reload wishlist
            await loadWishlist();
        } catch (error) {
            alert('Unable to remove item from wishlist');
        }
    };

    // Profile picture upload functionality
    const profileImageContainer = document.querySelector('.profile-image-container');
    const profileImage = document.getElementById('profile-image');
    const profilePictureInput = document.getElementById('profile-picture-input');

    if (profileImageContainer && profilePictureInput) {
        // Click on image container to trigger file input
        profileImageContainer.addEventListener('click', () => {
            profilePictureInput.click();
        });

        // Handle file selection
        profilePictureInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file) {
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image file size must be less than 5MB');
                return;
            }

            // Show preview immediately
            const reader = new FileReader();
            reader.onload = (e) => {
                if (profileImage) {
                    profileImage.src = e.target.result;
                }
            };
            reader.readAsDataURL(file);

            // Upload to server
            try {
                const formData = new FormData();
                formData.append('profilePicture', file);

                const response = await fetch('/profile/picture', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to upload profile picture');
                }

                renderMessage('Profile picture updated successfully!');
            } catch (error) {
                renderMessage(error.message || 'Failed to upload profile picture', true);
                // Reload profile to revert image on error
                loadProfile();
            }
        });
    }

    loadProfile();
    loadWishlist();
});
