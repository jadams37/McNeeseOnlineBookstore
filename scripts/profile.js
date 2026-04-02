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

    loadProfile();
});
