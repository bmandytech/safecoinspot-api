const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Users, PasswordResetTokens } = require('../models'); // Sequelize models
const nodemailer = require('nodemailer');
const router = express.Router();

// Email transport configuration (using Nodemailer)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Request Password Reset (Step 1)
router.post('/request-password-reset', async (req, res) => {
    const { email } = req.body;

    try {
        // Check if the user exists
        const user = await Users.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Create a password reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        const expirationTime = new Date(Date.now() + 3600000); // Token valid for 1 hour

        // Store the token in the database
        await PasswordResetTokens.create({
            user_id: user.id,
            token: resetToken,
            expires_at: expirationTime,
        });

        // Send the reset token to the user's email
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        await transporter.sendMail({
            to: email,
            subject: 'Password Reset Request',
            text: `To reset your password, please click on the following link: ${resetLink}`,
        });

        res.status(200).json({ message: 'Password reset link has been sent to your email.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Reset Password (Step 2)
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        // Find the reset token in the database
        const resetToken = await PasswordResetTokens.findOne({ where: { token } });
        if (!resetToken || resetToken.expires_at < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Find the user associated with the token
        const user = await Users.findByPk(resetToken.user_id);

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        // Optionally, delete the token to prevent reuse
        await resetToken.destroy();

        res.status(200).json({ message: 'Password successfully reset' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;