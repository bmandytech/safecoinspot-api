const express = require('express');
const { createCoinWallet, initiateTransaction, getTransactionDetails } = require('../controllers/transactionController');
const router = express.Router();

router.post('/create-wallet', createCoinWallet);  // Route to create a wallet
router.post('/transaction', initiateTransaction);  // Route to initiate transaction (buy crypto)
router.get('/transaction/:transactionId', getTransactionDetails);  // Route to fetch transaction info

module.exports = router;