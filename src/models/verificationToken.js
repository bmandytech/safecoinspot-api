const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Users, VerificationTokens } = require('./models'); // Sequelize models

const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
  const { email, password, phone } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await Users.create({ email, password: hashedPassword, phone });

    // Send Verification Token (Email)
    const emailToken = crypto.randomBytes(20).toString('hex');
    await VerificationTokens.create({
      user_id: user.id,
      token: emailToken,
      token_type: 'email',
      expires_at: new Date(Date.now() + 3600000), // Token valid for 1 hour
    });

    // Here you'd send the email with the token to the user
    // For now, we'll just log it
    console.log(`Email verification link: /verify-email?token=${emailToken}`);

    res.status(201).json({ message: 'User registered. Please verify your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;