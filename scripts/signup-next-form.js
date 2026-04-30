let onSecondStep = false;

const isValidPassword = (password) => (
    password.length >= 8
    && /\d/.test(password)
    && /[^A-Za-z0-9]/.test(password)
);

const renderMessage = (text, isError = false) => {
    const messageNode = document.getElementById('signup-message');
    if (!messageNode) {
        return;
    }

    messageNode.textContent = text;
    messageNode.style.color = isError ? '#c62828' : '#1b5e20';
};

const appendSecondStepFields = () => {
    const form = document.getElementById('signup');
    const secondStepHtml = `
        <label for="fullName" class="name-label">Full Name</label><br>
        <input class="name-input" id="fullName" type="text" name="fullName" required><br>
        <label for="physicalAddress" class="address-label">Address</label><br>
        <input class="address-input" id="physicalAddress" type="text" name="physicalAddress"><br>
        <label for="phoneNumber" class="phone-label">Phone Number</label><br>
        <input class="phone-input" id="phoneNumber" type="text" name="phoneNumber"><br>
    `;

    form.insertAdjacentHTML('beforeend', secondStepHtml);
};

const moveToSecondStep = () => {
    const form = document.getElementById('signup');
    const button = document.getElementById('next');

    if (!form || !button || onSecondStep) {
        return;
    }

    const email = document.getElementById('email')?.value?.trim();
    const username = document.getElementById('username')?.value?.trim();
    const password = document.getElementById('password')?.value || '';

    if (!email || !username || !password.trim()) {
        renderMessage('Please complete email, username, and password before continuing.', true);
        return;
    }

    if (!isValidPassword(password)) {
        renderMessage('Password must be at least 8 characters long and include a number and a special character.', true);
        return;
    }

    form.querySelectorAll(':scope > *').forEach((element) => {
        element.hidden = true;
    });

    appendSecondStepFields();
    button.textContent = 'Register';
    button.type = 'button';
    onSecondStep = true;
    renderMessage('Enter your profile details, then click Register.');
};

const submitRegistration = async () => {
    const payload = {
        email: document.getElementById('email')?.value?.trim(),
        username: document.getElementById('username')?.value?.trim(),
        password: document.getElementById('password')?.value,
        fullName: document.getElementById('fullName')?.value?.trim(),
        physicalAddress: document.getElementById('physicalAddress')?.value?.trim(),
        phoneNumber: document.getElementById('phoneNumber')?.value?.trim()
    };

    if (!payload.fullName) {
        renderMessage('Full name is required.', true);
        return;
    }

    if (!isValidPassword(payload.password || '')) {
        renderMessage('Password must be at least 8 characters long and include a number and a special character.', true);
        return;
    }

    renderMessage('Submitting registration...');

    try {
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed.');
        }

        renderMessage('Account created successfully. Redirecting to login...');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1200);
    } catch (error) {
        renderMessage(error.message || 'Unable to register right now.', true);
    }
};

window.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signup');
    const button = document.getElementById('next');

    if (!form || !button) {
        return;
    }

    button.addEventListener('click', async (event) => {
        event.preventDefault();

        if (!onSecondStep) {
            moveToSecondStep();
            return;
        }

        await submitRegistration();
    });
});