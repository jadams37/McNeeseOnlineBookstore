require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const pool = require('./db');

const app = express();
const port = Number(process.env.PORT || 3000);
const jwtSecret = process.env.JWT_SECRET || 'dev-only-change-me';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads', 'profile-pictures');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `profile-${req.user.userId}-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const ext = path.extname(file.originalname).toLowerCase();
        const mimeType = allowedTypes.test(file.mimetype);
        const extname = allowedTypes.test(ext);

        if (mimeType && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

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

const isValidPassword = (password) => (
    password.length >= 8
    && /\d/.test(password)
    && /[^A-Za-z0-9]/.test(password)
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

// Encryption function for card data
const encryptCardData = (cardData) => {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(jwtSecret, 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(cardData, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
};

// Configure nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Email sending function
const sendOrderEmail = async (orderData) => {
    const itemsList = orderData.items.map(item => 
        `${item.title} (x${item.quantity}) - $${Number(item.line_total).toFixed(2)}`
    ).join('\n');
    
    const mailOptions = {
        from: process.env.ORDER_EMAIL_FROM,
        to: process.env.ORDER_REVIEW_EMAIL,
        subject: `New Order #${orderData.orderId}`,
        text: `
New Order Received

Order ID: ${orderData.orderId}
Customer: ${orderData.customerName}
Email: ${orderData.customerEmail}

Items:
${itemsList}

Subtotal: $${Number(orderData.subtotal).toFixed(2)}
Tax (8.25%): $${Number(orderData.taxAmount).toFixed(2)}
Total: $${Number(orderData.total).toFixed(2)}

Shipping Address:
${orderData.shippingName}
${orderData.shippingAddress}
${orderData.shippingCity}, ${orderData.shippingState} ${orderData.shippingZip}

Billing Address:
${orderData.billingName}
${orderData.billingAddress}
${orderData.billingCity}, ${orderData.billingState} ${orderData.billingZip}

Encrypted Card Information:
${orderData.encryptedCard}

Card Name: ${orderData.cardName}
        `
    };
    
    await transporter.sendMail(mailOptions);
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

    const plainPassword = String(password);

    if (!isValidPassword(plainPassword)) {
        return res.status(400).json({
            message: 'Password must be at least 8 characters long and include a number and a special character.'
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

        const passwordHash = await bcrypt.hash(plainPassword, 12);

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

        console.log('Login successful for user:', user.user_id);

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
        where.push(`(
            p.title ILIKE $${values.length}
            OR p.author ILIKE $${values.length}
            OR p.sku ILIKE $${values.length}
            OR p.isbn ILIKE $${values.length}
            OR p.publisher ILIKE $${values.length}
            OR p.edition ILIKE $${values.length}
            OR c.name ILIKE $${values.length}
        )`);
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
                p.image_path,
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
                p.image_path,
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
                profile_picture_url,
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

app.post('/profile/picture', requireAuth, upload.single('profilePicture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        // Generate URL path for the uploaded file
        const profilePictureUrl = `/uploads/profile-pictures/${req.file.filename}`;

        // Get old profile picture to delete it
        const oldPicture = await pool.query(
            'SELECT profile_picture_url FROM users_account WHERE user_id = $1',
            [req.user.userId]
        );

        // Update database with new profile picture URL
        const result = await pool.query(
            `UPDATE users_account
             SET profile_picture_url = $1
             WHERE user_id = $2
             RETURNING profile_picture_url`,
            [profilePictureUrl, req.user.userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Delete old profile picture file if it exists
        if (oldPicture.rows[0]?.profile_picture_url) {
            const oldFilePath = path.join(__dirname, '..', oldPicture.rows[0].profile_picture_url);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }

        return res.status(200).json({
            message: 'Profile picture updated successfully.',
            profilePictureUrl: profilePictureUrl
        });
    } catch (error) {
        console.error('Profile picture upload error:', error);
        // Clean up uploaded file if database update fails
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({ message: 'Unable to upload profile picture right now.' });
    }
});

const getOrCreateCart = async (userId) => {
    let result = await pool.query('SELECT cart_id FROM cart WHERE user_id = $1', [userId]);
    if (result.rowCount > 0) {
        return result.rows[0].cart_id;
    }
    result = await pool.query('INSERT INTO cart (user_id) VALUES ($1) RETURNING cart_id', [userId]);
    return result.rows[0].cart_id;
};

app.get('/cart', requireAuth, async (req, res) => {
    const userId = req.user.userId;

    try {
        const cartId = await getOrCreateCart(userId);
        const result = await pool.query(
            `SELECT
                ci.cart_item_id,
                ci.quantity,
                p.product_id,
                p.title,
                p.author,
                p.price,
                p.quantity_in_stock,
                p.image_path,
                (ci.quantity * p.price) AS line_total
             FROM cart_item ci
             JOIN product p ON p.product_id = ci.product_id
             WHERE ci.cart_id = $1
             ORDER BY ci.cart_item_id`,
            [cartId]
        );

        const items = result.rows;
        const subtotal = items.reduce((sum, item) => sum + Number(item.line_total), 0);
        const taxRate = 0.0825; // Example tax rate
        const taxAmount = subtotal * taxRate;
        const total = subtotal + taxAmount;

        return res.status(200).json({
            cart: {
                items,
                subtotal: subtotal.toFixed(2),
                tax_amount: taxAmount.toFixed(2),
                total: total.toFixed(2)
            }
        });
    } catch (error) {
        console.error('Cart view error:', error);
        return res.status(500).json({ message: 'Unable to load cart right now.' });
    }
});

app.post('/cart/items', requireAuth, async (req, res) => {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;

    if (!userId) {
        return res.status(401).json({ message: 'Invalid user session. Please log in again.' });
    }

    console.log('Add to cart:', { userId, productId, quantity });

    if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({ message: 'Product ID and positive quantity required.' });
    }

    try {
        const cartId = await getOrCreateCart(userId);

        console.log('Cart ID:', cartId);

        // Check if item already in cart
        let result = await pool.query(
            'SELECT cart_item_id, quantity FROM cart_item WHERE cart_id = $1 AND product_id = $2',
            [cartId, productId]
        );

        if (result.rowCount > 0) {
            // Update quantity
            const newQuantity = result.rows[0].quantity + quantity;
            await pool.query(
                'UPDATE cart_item SET quantity = $1 WHERE cart_item_id = $2',
                [newQuantity, result.rows[0].cart_item_id]
            );
        } else {
            // Insert new item
            await pool.query(
                'INSERT INTO cart_item (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
                [cartId, productId, quantity]
            );
        }

        return res.status(201).json({ message: 'Item added to cart.' });
    } catch (error) {
        console.error('Add to cart error:', error);
        return res.status(500).json({ message: `Unable to add item to cart right now: ${error.message}` });
    }
});

app.put('/cart/items/:itemId', requireAuth, async (req, res) => {
    const userId = req.user.userId;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 0) {
        return res.status(400).json({ message: 'Valid quantity required.' });
    }

    try {
        const cartId = await getOrCreateCart(userId);

        if (quantity === 0) {
            // Remove item
            const result = await pool.query(
                'DELETE FROM cart_item WHERE cart_item_id = $1 AND cart_id = $2',
                [itemId, cartId]
            );
            if (result.rowCount === 0) {
                return res.status(404).json({ message: 'Cart item not found.' });
            }
            return res.status(200).json({ message: 'Item removed from cart.' });
        } else {
            // Update quantity
            const result = await pool.query(
                'UPDATE cart_item SET quantity = $1 WHERE cart_item_id = $2 AND cart_id = $3',
                [quantity, itemId, cartId]
            );
            if (result.rowCount === 0) {
                return res.status(404).json({ message: 'Cart item not found.' });
            }
            return res.status(200).json({ message: 'Cart item updated.' });
        }
    } catch (error) {
        console.error('Update cart item error:', error);
        return res.status(500).json({ message: 'Unable to update cart item right now.' });
    }
});

app.delete('/cart/items/:itemId', requireAuth, async (req, res) => {
    const userId = req.user.userId;
    const { itemId } = req.params;

    try {
        const cartId = await getOrCreateCart(userId);
        const result = await pool.query(
            'DELETE FROM cart_item WHERE cart_item_id = $1 AND cart_id = $2',
            [itemId, cartId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Cart item not found.' });
        }

        return res.status(200).json({ message: 'Item removed from cart.' });
    } catch (error) {
        console.error('Remove cart item error:', error);
        return res.status(500).json({ message: 'Unable to remove item from cart right now.' });
    }
});

// Checkout endpoint
app.post('/checkout', requireAuth, async (req, res) => {
    const userId = req.user.userId;
    const {
        cardNumber,
        cardCvv,
        cardExpiry,
        cardName,
        billingName,
        billingEmail,
        billingAddress,
        billingCity,
        billingState,
        billingZip,
        shippingName,
        shippingAddress,
        shippingCity,
        shippingState,
        shippingZip
    } = req.body;

    try {
        // Get cart items
        const cartId = await getOrCreateCart(userId);
        const cartResult = await pool.query(
            `SELECT
                ci.cart_item_id,
                ci.product_id,
                ci.quantity,
                p.title,
                p.price,
                (p.price * ci.quantity) as line_total
             FROM cart_item ci
             JOIN product p ON ci.product_id = p.product_id
             WHERE ci.cart_id = $1`,
            [cartId]
        );

        const items = cartResult.rows;

        if (items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty.' });
        }

        // Calculate totals
        const subtotal = items.reduce((sum, item) => sum + Number(item.line_total), 0);
        const taxRate = 0.0825;
        const taxAmount = subtotal * taxRate;
        const total = subtotal + taxAmount;

        // Create order
        const orderResult = await pool.query(
            `INSERT INTO orders (user_id, status, subtotal, tax_amount, total_amount)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING order_id`,
            [userId, 'pending', subtotal, taxAmount, total]
        );
        const orderId = orderResult.rows[0].order_id;

        // Create order items
        for (const item of items) {
            await pool.query(
                `INSERT INTO order_item (order_id, product_id, quantity, unit_price, line_total)
                 VALUES ($1, $2, $3, $4, $5)`,
                [orderId, item.product_id, item.quantity, item.price, item.line_total]
            );
        }

        // Encrypt card data
        const cardData = `Card: ${cardNumber} | CVV: ${cardCvv} | Expiry: ${cardExpiry}`;
        const encryptedCard = encryptCardData(cardData);

        // Send email
        await sendOrderEmail({
            orderId,
            items,
            subtotal,
            taxAmount,
            total,
            encryptedCard,
            cardName,
            customerName: billingName,
            customerEmail: billingEmail,
            billingName,
            billingAddress,
            billingCity,
            billingState,
            billingZip,
            shippingName,
            shippingAddress,
            shippingCity,
            shippingState,
            shippingZip
        });

        // Clear cart
        await pool.query('DELETE FROM cart_item WHERE cart_id = $1', [cartId]);

        return res.status(200).json({
            message: 'Order placed successfully',
            orderId
        });
    } catch (error) {
        console.error('Checkout error:', error);
        return res.status(500).json({ message: 'Unable to process order right now.' });
    }
});

// Wishlist endpoints
const getOrCreateWishlist = async (userId) => {
    let result = await pool.query('SELECT wishlist_id FROM wishlist WHERE user_id = $1', [userId]);
    if (result.rowCount > 0) {
        return result.rows[0].wishlist_id;
    }
    result = await pool.query('INSERT INTO wishlist (user_id) VALUES ($1) RETURNING wishlist_id', [userId]);
    return result.rows[0].wishlist_id;
};

app.get('/wishlist', requireAuth, async (req, res) => {
    const userId = req.user.userId;

    try {
        const wishlistId = await getOrCreateWishlist(userId);
        const result = await pool.query(
            `SELECT
                wi.wishlist_item_id,
                wi.added_at,
                p.product_id,
                p.title,
                p.author,
                p.price,
                p.condition,
                p.quantity_in_stock,
                p.image_path,
                c.name AS category_name
             FROM wishlist_item wi
             JOIN product p ON p.product_id = wi.product_id
             LEFT JOIN category c ON c.category_id = p.category_id
             WHERE wi.wishlist_id = $1
             ORDER BY wi.added_at DESC`,
            [wishlistId]
        );

        return res.status(200).json({ wishlist: result.rows });
    } catch (error) {
        console.error('Wishlist view error:', error);
        return res.status(500).json({ message: 'Unable to load wishlist right now.' });
    }
});

app.post('/wishlist/items', requireAuth, async (req, res) => {
    const userId = req.user.userId;
    const { productId } = req.body;

    if (!productId) {
        return res.status(400).json({ message: 'Product ID required.' });
    }

    try {
        const wishlistId = await getOrCreateWishlist(userId);

        // Check if item already in wishlist
        const existing = await pool.query(
            'SELECT wishlist_item_id FROM wishlist_item WHERE wishlist_id = $1 AND product_id = $2',
            [wishlistId, productId]
        );

        if (existing.rowCount > 0) {
            return res.status(409).json({ message: 'Item already in wishlist.' });
        }

        await pool.query(
            'INSERT INTO wishlist_item (wishlist_id, product_id) VALUES ($1, $2)',
            [wishlistId, productId]
        );

        return res.status(201).json({ message: 'Item added to wishlist.' });
    } catch (error) {
        console.error('Add to wishlist error:', error);
        return res.status(500).json({ message: 'Unable to add item to wishlist right now.' });
    }
});

app.delete('/wishlist/items/:productId', requireAuth, async (req, res) => {
    const userId = req.user.userId;
    const { productId } = req.params;

    try {
        const wishlistId = await getOrCreateWishlist(userId);
        const result = await pool.query(
            'DELETE FROM wishlist_item WHERE wishlist_id = $1 AND product_id = $2',
            [wishlistId, productId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Item not in wishlist.' });
        }

        return res.status(200).json({ message: 'Item removed from wishlist.' });
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        return res.status(500).json({ message: 'Unable to remove item from wishlist right now.' });
    }
});

app.listen(port, () => {
    console.log(`Auth server listening on http://localhost:${port}`);
});
