// /src/routes/transactionRoutes.js

const express = require('express');
const router = express.Router();
const { processTransaction } = require('../services/transactionService');  // Importing the service

// Route for processing a transaction
router.post('/process', async (req, res) => {
  const { transactionId, coinType, coinAmount, userId } = req.body;

  try {
    await processTransaction(transactionId, coinType, coinAmount, userId);
    res.status(200).json({ message: 'Transaction processed successfully' });
  } catch (err) {
    console.error('Error processing transaction:', err);
    res.status(500).json({ message: 'Failed to process transaction' });
  }
});

module.exports = router;