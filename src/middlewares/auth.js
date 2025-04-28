// File: middlewares/auth.js (Optional, if you want to modularize)

// Import the necessary libraries
const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT tokens
const authenticateToken = (req, res, next) => {
    // Get the token from the Authorization header
    const token = req.header('Authorization');

    // If token is not provided, return a 403 error
    if (!token) {
        return res.status(403).json({ error: 'Access Denied' });
    }

    // Verify the token using JWT_SECRET from environment variables
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        // If there is an error verifying the token, return a 403 error
        if (err) {
            return res.status(403).json({ error: 'Invalid Token' });
        }

        // If token is valid, attach the user object to the request
        req.user = user;

        // Continue to the next middleware or route handler
        next();
    });
};

module.exports = authenticateToken;
