const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const fetch = require('node-fetch');

dotenv.config();

const app = express();

// Middleware
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.stack);
        return;
    }
    console.log('Connected to MySQL database');
});

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'smtp',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Routes
const walletRoutes = require('./src/routes/walletRoutes');
const coinPaymentsRoutes = require('./src/routes/coinPaymentsRoutes');

app.use('/api/wallets', walletRoutes);
app.use('/api/coinpayments', coinPaymentsRoutes); // 🛑 Fixed wrong route path here

// Biometric Login
app.post('/api/biometric-login', (req, res) => {
    const { biometricData } = req.body;

    if (!biometricData) {
        return res.status(400).json({ success: false, message: 'Biometric data is required' });
    }

    const biometricVerified = verifyBiometricData(biometricData);

    if (biometricVerified) {
        const user = { id: 1, name: 'John Doe' }; // 🔥 Replace with real DB lookup
        const token = generateToken(user);
        return res.json({ success: true, token });
    } else {
        return res.status(401).json({ success: false, message: 'Biometric authentication failed' });
    }
});

function verifyBiometricData(biometricData) {
    return biometricData === 'valid-bio-data';
}

function generateToken(user) {
    const payload = { id: user.id, name: user.name };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

// Register route
app.post('/register', async (req, res) => { // 🛑 Fixed wrong route path here
    const { username, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        db.query(query, [username, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Error registering user:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Welcome to Safecoinspot!',
                text: `Hello ${username},\n\nThank you for signing up on Safecoinspot. We are glad to have you with us.`,
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error('Error sending email:', err);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });

            res.status(201).json({ message: 'User registered successfully' });
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login route
app.post('/login', (req, res) => { // 🛑 Fixed wrong route path here
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (result.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const user = result[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: user.id }, process.env.REFRESH_TOKEN_SECRET);

        res.json({ accessToken, refreshToken });
    });
});

// Refresh Token route
app.post('/refresh-token', (req, res) => { // 🛑 Fixed wrong route path here
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        const newAccessToken = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '15m' });

        res.json({ accessToken: newAccessToken });
    });
});

// Get coins route
app.get('/api/coins', (req, res) => { // 🛑 Fixed wrong route path here
    const coins = [
        { id: 1, name: 'Bitcoin', symbol: 'BTC', logoUrl: 'https://path-to-logo/bitcoin.png' },
        { id: 2, name: 'Ethereum', symbol: 'ETH', logoUrl: 'https://path-to-logo/ethereum.png' },
        { id: 3, name: 'XRP', symbol: 'XRP', logoUrl: 'https://path-to-logo/xrp.png' },
        { id: 4, name: 'Litecoin', symbol: 'LTC', logoUrl: 'https://path-to-logo/litecoin.png' }
    ];
    res.json({ coins });
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
