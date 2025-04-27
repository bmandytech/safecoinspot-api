const express = require('express');
const verifyToken = require('../middlewares/authMiddleware');
const router = express.Router();

// Protected route example
router.get('/profile', verifyToken, (req, res) => {
    res.json({ message: 'Welcome to your profile', user: req.user });
});

module.exports = router;
