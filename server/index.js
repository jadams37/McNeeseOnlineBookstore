require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const pool = require('./db');

const app = express();
const port = Number(process.env.PORT || 3000);
const jwtSecret = process.env.JWT_SECRET || 'dev-only-change-me';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

app.get('/', (_req, res) => {
    res.redirect('/login.html');
});

app.get('/health', async (_req, res) => {
    try {
        await pool.query('SELECT 1');
        res.status(200).json({ status: 'ok' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Database unavailable' });
    }
});

const createAuthToken = (user) => jwt.sign(
    {
        sub: user.user_id,
        email: user.email,
        username: user.username,
        role: user.role
    },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
);

const requireAuth = (req, res, next) => {
    const authorization = req.headers.authorization || '';
    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ message: 'Authentication token required.' });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = {
            userId: decoded.sub,
            email: decoded.email,
            username: decoded.username,
            role: decoded.role
        };
        return next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired authentication token.' });
    }
};

app.post('/auth/register', async (req, res) => {
    const {
        email,
        username,
        password,
        fullName,
        physicalAddress,
        phoneNumber
    } = req.body;

    if (!email || !username || !password || !fullName) {
        return res.status(400).json({
            message: 'Email, username, password, and full name are required.'
        });
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedUsername = String(username).trim();
    const trimmedName = String(fullName).trim();
    const trimmedAddress = physicalAddress ? String(physicalAddress).trim() : null;
    const trimmedPhone = phoneNumber ? String(phoneNumber).trim() : null;

    const [firstName, ...restOfName] = trimmedName.split(/\s+/);
    const lastName = restOfName.length > 0 ? restOfName.join(' ') : 'N/A';

    try {
        const existing = await pool.query(
            `SELECT user_id
             FROM users_account
             WHERE email = $1 OR username = $2
             LIMIT 1`,
            [trimmedEmail, trimmedUsername]
        );

        if (existing.rowCount > 0) {
            return res.status(409).json({ message: 'Email or username is already in use.' });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const created = await pool.query(
            `INSERT INTO users_account (
                email,
                username,
                password_hash,
                first_name,
                last_name,
                physical_address,
                phone_number
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING user_id, email, username, first_name, last_name, physical_address, phone_number`,
            [
                trimmedEmail,
                trimmedUsername,
                passwordHash,
                firstName,
                lastName,
                trimmedAddress,
                trimmedPhone
            ]
        );

        return res.status(201).json({
            message: 'Account created successfully.',
            user: created.rows[0]
        });
    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ message: 'Unable to register right now.' });
    }
});

app.post('/auth/login', async (req, res) => {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
        return res.status(400).json({ message: 'Username/email and password are required.' });
    }

    const identifier = String(usernameOrEmail).trim();

    try {
        const result = await pool.query(
            `SELECT user_id, email, username, password_hash, first_name, last_name, role
             FROM users_account
             WHERE email = $1 OR username = $1
             LIMIT 1`,
            [identifier]
        );

        if (result.rowCount === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = createAuthToken(user);

        return res.status(200).json({
            message: 'Login successful.',
            token,
            user: {
                userId: user.user_id,
                email: user.email,
                username: user.username,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Unable to login right now.' });
    }
});

app.get('/auth/me', requireAuth, (req, res) => {
    res.status(200).json({ user: req.user });
});

app.listen(port, () => {
    console.log(`Auth server listening on http://localhost:${port}`);
});
