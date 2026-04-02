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

app.get('/products', async (req, res) => {
    const search = String(req.query.q || '').trim();
    const condition = String(req.query.condition || '').trim().toLowerCase();
    const category = String(req.query.category || '').trim().toLowerCase();
    const sort = String(req.query.sort || 'title_asc').trim().toLowerCase();

    const where = ['p.is_active = TRUE'];
    const values = [];

    if (search) {
        values.push(`%${search}%`);
        where.push(`(p.title ILIKE $${values.length} OR p.author ILIKE $${values.length} OR p.sku ILIKE $${values.length} OR p.isbn ILIKE $${values.length})`);
    }

    if (condition) {
        values.push(condition);
        where.push(`p.condition = $${values.length}`);
    }

    if (category) {
        values.push(category);
        where.push(`LOWER(c.name) = $${values.length}`);
    }

    const sortMap = {
        title_asc: 'p.title ASC',
        title_desc: 'p.title DESC',
        price_asc: 'p.price ASC',
        price_desc: 'p.price DESC',
        newest: 'p.created_at DESC'
    };
    const orderBy = sortMap[sort] || sortMap.title_asc;

    try {
        const result = await pool.query(
            `SELECT
                p.product_id,
                p.sku,
                p.isbn,
                p.title,
                p.author,
                p.publisher,
                p.edition,
                p.condition,
                p.price,
                p.quantity_in_stock,
                c.name AS category_name
             FROM product p
             LEFT JOIN category c ON c.category_id = p.category_id
             WHERE ${where.join(' AND ')}
             ORDER BY ${orderBy}`,
            values
        );

        res.status(200).json({ products: result.rows });
    } catch (error) {
        console.error('Products list error:', error);
        res.status(500).json({ message: 'Unable to load products right now.' });
    }
});

app.get('/products/:productId', async (req, res) => {
    const { productId } = req.params;

    try {
        const result = await pool.query(
            `SELECT
                p.product_id,
                p.sku,
                p.isbn,
                p.title,
                p.author,
                p.publisher,
                p.edition,
                p.condition,
                p.price,
                p.quantity_in_stock,
                c.name AS category_name,
                p.created_at,
                p.updated_at
             FROM product p
             LEFT JOIN category c ON c.category_id = p.category_id
             WHERE p.product_id = $1 AND p.is_active = TRUE
             LIMIT 1`,
            [productId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        return res.status(200).json({ product: result.rows[0] });
    } catch (error) {
        console.error('Product detail error:', error);
        return res.status(500).json({ message: 'Unable to load product details right now.' });
    }
});

app.get('/profile/me', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                user_id,
                email,
                username,
                first_name,
                last_name,
                physical_address,
                phone_number,
                role,
                created_at
             FROM users_account
             WHERE user_id = $1
             LIMIT 1`,
            [req.user.userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Profile not found.' });
        }

        return res.status(200).json({ profile: result.rows[0] });
    } catch (error) {
        console.error('Profile read error:', error);
        return res.status(500).json({ message: 'Unable to load profile right now.' });
    }
});

app.put('/profile/me', requireAuth, async (req, res) => {
    const firstName = req.body.firstName ? String(req.body.firstName).trim() : null;
    const lastName = req.body.lastName ? String(req.body.lastName).trim() : null;
    const phoneNumber = req.body.phoneNumber ? String(req.body.phoneNumber).trim() : null;
    const physicalAddress = req.body.physicalAddress ? String(req.body.physicalAddress).trim() : null;

    if (!firstName || !lastName) {
        return res.status(400).json({ message: 'First name and last name are required.' });
    }

    try {
        const result = await pool.query(
            `UPDATE users_account
             SET first_name = $1,
                 last_name = $2,
                 phone_number = $3,
                 physical_address = $4
             WHERE user_id = $5
             RETURNING user_id, email, username, first_name, last_name, phone_number, physical_address`,
            [firstName, lastName, phoneNumber, physicalAddress, req.user.userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Profile not found.' });
        }

        return res.status(200).json({ message: 'Profile updated.', profile: result.rows[0] });
    } catch (error) {
        console.error('Profile update error:', error);
        return res.status(500).json({ message: 'Unable to update profile right now.' });
    }
});

app.listen(port, () => {
    console.log(`Auth server listening on http://localhost:${port}`);
});
