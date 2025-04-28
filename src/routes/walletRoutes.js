// src/routes/walletRoutes.js

const express = require('express');
const router = express.Router();

// Example data structure for wallets (can be replaced with database interaction later)
let wallets = [
    {
        id: 1,
        userId: 1,
        coin: 'Bitcoin',
        balance: 2.5,
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
    },
    {
        id: 2,
        userId: 1,
        coin: 'Ethereum',
        balance: 5.0,
        address: '0x32Be343B94f860124dC4fEe278FDCBD38C102D88'
    }
];

// Route to create a wallet for a user
router.post('/create', (req, res) => {
    const { userId, coin, address } = req.body;

    // Validate data
    if (!userId || !coin || !address) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if wallet with the same coin exists for the user
    const existingWallet = wallets.find(wallet => wallet.userId === userId && wallet.coin === coin);
    if (existingWallet) {
        return res.status(400).json({ success: false, message: 'Wallet with this coin already exists' });
    }

    // Create a new wallet (in a real app, store this in a database)
    const newWallet = {
        id: wallets.length + 1,
        userId,
        coin,
        balance: 0,  // Initially balance is 0
        address
    };

    wallets.push(newWallet);
    res.status(201).json({ success: true, wallet: newWallet });
});

// Route to get all wallets for a user
router.get('/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);

    // Find wallets belonging to the user
    const userWallets = wallets.filter(wallet => wallet.userId === userId);

    if (userWallets.length === 0) {
        return res.status(404).json({ success: false, message: 'No wallets found for this user' });
    }

    res.json({ success: true, wallets: userWallets });
});

// Route to get a specific wallet by userId and walletId
router.get('/:userId/:walletId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const walletId = parseInt(req.params.walletId);

    // Find the specific wallet
    const wallet = wallets.find(wallet => wallet.userId === userId && wallet.id === walletId);

    if (!wallet) {
        return res.status(404).json({ success: false, message: 'Wallet not found' });
    }

    res.json({ success: true, wallet });
});

// Route to update wallet balance
router.put('/:userId/:walletId/update-balance', (req, res) => {
    const userId = parseInt(req.params.userId);
    const walletId = parseInt(req.params.walletId);
    const { amount } = req.body;

    // Find the wallet to update
    const wallet = wallets.find(wallet => wallet.userId === userId && wallet.id === walletId);

    if (!wallet) {
        return res.status(404).json({ success: false, message: 'Wallet not found' });
    }

    // Update the wallet balance
    if (typeof amount !== 'number') {
        return res.status(400).json({ success: false, message: 'Amount should be a number' });
    }

    wallet.balance += amount;  // Adding to the balance, can be modified for withdrawal or deposit
    res.json({ success: true, wallet });
});

module.exports = router;
