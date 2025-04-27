// /src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateJWT = (req, res, next) => {
    // Get the token from the Authorization header (prefixed with 'Bearer')
    const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];

    // If token is not provided, send an unauthorized error
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // Verify the token using the secret key stored in environment variables
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the decoded user data (e.g., email) to the request object
        req.user = decoded;

        // Continue to the next middleware or route handler
        next();
    } catch (error) {
        // Token verification failed, send an invalid token response
        return res.status(400).json({ message: 'Invalid token. Please log in again.' });
    }
};

module.exports = authenticateJWT;