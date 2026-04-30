window.addEventListener('DOMContentLoaded', async () => {
    const profileLink = document.querySelector('.profile-link') || document.querySelector('.profile-label');
    const profileTextNode = profileLink?.querySelector('.profile-text') || profileLink;
    const profileContainer = document.querySelector('.profile');

    if (!profileLink || !profileTextNode) {
        return;
    }

    const clearAuth = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
    };

    const removeLogoutLink = () => {
        if (!profileContainer) {
            return;
        }

        const existing = profileContainer.querySelector('.logout-link');
        if (existing) {
            existing.remove();
        }
    };

    const ensureLogoutLink = () => {
        if (!profileContainer) {
            return;
        }

        let logoutLink = profileContainer.querySelector('.logout-link');
        if (!logoutLink) {
            logoutLink = document.createElement('a');
            logoutLink.className = 'logout-link';
            logoutLink.href = 'login.html';
            logoutLink.textContent = 'Logout';
            profileContainer.appendChild(logoutLink);
        }

        logoutLink.onclick = (event) => {
            event.preventDefault();
            clearAuth();
            window.location.href = 'login.html';
        };
    };

    const token = localStorage.getItem('authToken');

    const setDestination = (target, href) => {
        if (!target) {
            return;
        }

        if (target.tagName === 'A') {
            target.setAttribute('href', href);
            target.removeAttribute('role');
            target.style.cursor = '';
            target.onclick = null;
            return;
        }

        target.setAttribute('role', 'button');
        target.style.cursor = 'pointer';
        target.onclick = () => {
            window.location.href = href;
        };
    };

    const fallbackToGuest = () => {
        profileTextNode.textContent = 'Profile';
        setDestination(profileLink, 'login.html');

        removeLogoutLink();
    };

    if (!token) {
        fallbackToGuest();
        return;
    }

    try {
        const response = await fetch('/auth/me', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Invalid token');
        }

        const data = await response.json();
        const username = data?.user?.username;

        if (!username) {
            throw new Error('Missing username');
        }

        profileTextNode.textContent = username;
        setDestination(profileLink, 'Profile.html');

        ensureLogoutLink();
    } catch (_error) {
        clearAuth();
        fallbackToGuest();
    }
});
