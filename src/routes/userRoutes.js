// /src/routes/userRoutes.js
const express = require('express');
const authenticateJWT = require('../middleware/authMiddleware'); // Import the middleware
const router = express.Router();

// Example of a protected route
router.get('/profile', authenticateJWT, (req, res) => {
    // You can now access req.user because it's been populated by the authenticateJWT middleware
    res.json({ message: 'Profile data', user: req.user });
});

module.exports = router;