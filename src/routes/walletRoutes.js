const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');

// Route for creating a wallet
router.post('/create', async (req, res) => {
    const { userId, coinType } = req.body;
    
    try {
        const wallet = await walletController.createWallet(userId, coinType);
        res.status(201).json({
            message: 'Wallet created successfully',
            wallet: wallet
        });
    } catch (err) {
        res.status(500).json({ message: 'Error creating wallet', error: err.message });
    }
});

// Route for getting wallet balance
router.get('/balance', async (req, res) => {
    const { userId, coinType } = req.query;
    
    try {
        const balance = await walletController.getBalance(userId, coinType);
        res.status(200).json({
            message: 'Wallet balance retrieved successfully',
            balance: balance,
        });
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving wallet balance', error: err.message });
    }
});

module.exports = router;
