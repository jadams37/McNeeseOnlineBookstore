window.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login');
    const messageNode = document.getElementById('login-message');

    if (!form) {
        return;
    }

    const renderMessage = (text, isError = false) => {
        if (!messageNode) {
            return;
        }

        messageNode.textContent = text;
        messageNode.style.color = isError ? '#c62828' : '#1b5e20';
    };

    const verifyToken = async (token) => {
        const response = await fetch('/auth/me', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            return false;
        }

        return true;
    };

    const existingToken = localStorage.getItem('authToken');
    if (existingToken) {
        verifyToken(existingToken).then((isValid) => {
            if (isValid) {
                window.location.href = 'homepage.html';
                return;
            }

            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
        });
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const usernameOrEmail = document.getElementById('username')?.value?.trim();
        const password = document.getElementById('password')?.value;

        if (!usernameOrEmail || !password) {
            renderMessage('Please enter both username/email and password.', true);
            return;
        }

        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ usernameOrEmail, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed.');
            }

            if (!data.token) {
                throw new Error('Login succeeded but no token was returned.');
            }

            localStorage.setItem('authToken', data.token);
            localStorage.setItem('authUser', JSON.stringify(data.user || {}));

            renderMessage('Login successful. Redirecting...');
            setTimeout(() => {
                window.location.href = 'homepage.html';
            }, 1000);
        } catch (error) {
            renderMessage(error.message || 'Unable to login right now.', true);
        }
    });
});
