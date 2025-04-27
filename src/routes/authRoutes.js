const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Users, VerificationTokens } = require('../models'); // Sequelize models

const router = express.Router();

// Simulate a user database (you would typically use a real database)
const users = []; // This is just an example. You'd replace this with Sequelize database calls.

// Register Route
router.post('/register', async (req, res) => {
    const { email, password, phone } = req.body;

    try {
        // Check if user exists
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user (for this example, we're just adding to an array)
        const newUser = { email, password: hashedPassword, phone };
        users.push(newUser);

        // Generate JWT Token
        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Generate email verification token
        const emailToken = crypto.randomBytes(20).toString('hex');
        await VerificationTokens.create({
            user_id: newUser.id,
            token: emailToken,
            token_type: 'email',
            expires_at: new Date(Date.now() + 3600000), // Token valid for 1 hour
        });

        // Here you'd send the email with the token to the user
        // For now, we'll just log it
        console.log(`Email verification link: /verify-email?token=${emailToken}`);

        res.status(201).json({
            message: 'User registered successfully. Please verify your email.',
            token: token
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Verify Email Route
router.get('/verify-email', async (req, res) => {
    const { token } = req.query;

    try {
        // Find the verification token
        const verification = await VerificationTokens.findOne({
            where: { token, token_type: 'email' }
        });

        if (!verification || verification.expires_at < new Date()) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        // Find the user associated with the token
        const user = await Users.findByPk(verification.user_id);
        
        // Mark the email as verified
        user.email_verified = true;
        await user.save();
        
        res.status(200).json({ message: 'Email successfully verified' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Compare the password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT Token
        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({
            message: 'Login successful',
            token: token
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;