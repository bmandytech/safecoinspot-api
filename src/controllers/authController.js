const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database'); // MySQL connection setup

// Register a new user
exports.register = async (req, res) => {
    const { email, password, phone } = req.body;

    // Check if the user already exists
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Server error', error: err });
        }
        if (results.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the user into the database
        db.query('INSERT INTO users (email, password, phone) VALUES (?, ?, ?)', [email, hashedPassword, phone], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Error creating user', error: err });
            }

            // Generate JWT token
            const token = jwt.sign({ id: results.insertId, email }, process.env.JWT_SECRET, { expiresIn: '1h' });

            res.status(201).json({
                message: 'User registered successfully',
                token,
            });
        });
    });
};

// Login user
exports.login = async (req, res) => {
    const { email, password } = req.body;

    // Check if the user exists
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Server error', error: err });
        }
        if (results.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare the password
        const isMatch = await bcrypt.compare(password, results[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: results[0].id, email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            message: 'User logged in successfully',
            token,
        });
    });
};
