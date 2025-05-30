const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); // Add Nodemailer for email functionality
const bcrypt = require('bcryptjs'); // For password hashing
const sequelize = require('./config/db'); // Sequelize DB connection

dotenv.config(); // Load environment variables from .env file

const app = express();

// Middleware
app.use(bodyParser.json()); // For parsing JSON bodies

// Import wallet routes from the src folder
const walletRoutes = require('./routes/walletRoutes');  // Adjusted path to src folder

// Import CoinPayments routes
const coinPaymentsRoutes = require('./routes/coinPaymentsRoutes');  // Path for coinPaymentsRoutes

// Use wallet routes
app.use('/api/wallets', walletRoutes);

// Use CoinPayments routes
app.use('/api/coinpayments', coinPaymentsRoutes);  // Add CoinPayments routes to the API

// Add Biometric Login route (example route for handling biometric data)
app.post('/api/biometric-login', (req, res) => {
    const { biometricData } = req.body;

    if (!biometricData) {
        return res.status(400).json({ success: false, message: 'Biometric data is required' });
    }

    // Example: Verify biometric data (this is just a placeholder for your actual verification logic)
    const biometricVerified = verifyBiometricData(biometricData);

    if (biometricVerified) {
        // If biometric verification is successful, retrieve user info and issue a token
        const user = { id: 1, name: 'John Doe' }; // Fetch user info from the database based on the biometric data (this is just a placeholder)
        
        // Generate a token (JWT or similar)
        const token = generateToken(user);

        return res.json({ success: true, token });
    } else {
        return res.status(401).json({ success: false, message: 'Biometric authentication failed' });
    }
});

// Function to simulate biometric data verification (replace with actual logic)
function verifyBiometricData(biometricData) {
    // Placeholder logic for biometric data verification.
    // You should integrate a real WebAuthn API or similar biometric service here.
    return biometricData === 'valid-bio-data'; // Replace with actual verification logic
}

// Function to generate a token (JWT or similar)
function generateToken(user) {
    // Generate JWT token for the user
    const payload = { id: user.id, name: user.name }; // Payload with user info
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }); // Use JWT secret from .env and set expiration time (1 hour)
    return token;
}

// Register route
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
  
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store user in the database
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    sequelize.query(query, [username, email, hashedPassword]).then(() => {
        // Send a welcome email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to Safecoinspot!',
            text: `Hello ${username},\n\nThank you for signing up on Safecoinspot. We are glad to have you with us.`,
        };

        // Create transporter with SMTP configuration
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Can be changed based on your email service
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Error sending email:', err);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.status(201).json({ message: 'User registered successfully' });
    }).catch(err => {
        console.error('Error registering user:', err);
        res.status(500).json({ error: 'Database error' });
    });
});

// Login route
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // Check if user exists
    const query = 'SELECT * FROM users WHERE email = ?';
    sequelize.query(query, { replacements: [email], type: sequelize.QueryTypes.SELECT }).then(async (result) => {
        if (result.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const user = result[0];

        // Compare passwords
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Create JWT token
        const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: '15m',
        });

        // Create Refresh Token
        const refreshToken = jwt.sign({ userId: user.id }, process.env.REFRESH_TOKEN_SECRET);

        // Send back the tokens
        res.json({ accessToken, refreshToken });
    }).catch(err => {
        res.status(500).json({ error: 'Database error' });
    });
});

// Refresh token route
app.post('/api/refresh-token', (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        // Generate a new access token
        const newAccessToken = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, {
            expiresIn: '15m',
        });

        res.json({ accessToken: newAccessToken });
    });
});

// Route to get the list of available coins
app.get('/api/coins', (req, res) => {
    // Example static list of coins (replace this with dynamic data from DB or third-party API)
    const coins = [
        { id: 1, name: 'Bitcoin', symbol: 'BTC', logoUrl: 'https://path-to-logo/bitcoin.png' },
        { id: 2, name: 'Ethereum', symbol: 'ETH', logoUrl: 'https://path-to-logo/ethereum.png' },
        { id: 3, name: 'XRP', symbol: 'XRP', logoUrl: 'https://path-to-logo/xrp.png' },
        { id: 4, name: 'Litecoin', symbol: 'LTC', logoUrl: 'https://path-to-logo/litecoin.png' }
    ];

    // Send the list of coins as a JSON response
    res.json({ coins });
});

// Set up the server to listen on a specific port
const PORT = process.env.PORT || 5000;  // Default to 5000 if not specified in .env
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
