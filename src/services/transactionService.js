// /src/services/transactionService.js

const mysql = require('mysql2');  // For MySQL connection
const axios = require('axios');  // For currency conversion (optional)
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Function to get conversion rate (optional for fiat)
const getConversionRate = async (currencyCode) => {
  try {
    // Get conversion rate from the database
    const [rows] = await db.promise().query('SELECT rate FROM currency_rates WHERE currency_code = ?', [currencyCode]);
    if (rows.length > 0) {
      return rows[0].rate;
    }
    // Default to 1 if no conversion rate found (USD)
    return 1;  
  } catch (err) {
    console.error('Error fetching conversion rate:', err);
    throw new Error('Failed to fetch conversion rate');
  }
};

// Function to process a completed transaction
const processTransaction = async (transactionId, coinType, coinAmount, userId) => {
  try {
    // 1. Get the transaction details
    const [transaction] = await db.promise().query('SELECT * FROM transactions WHERE id = ?', [transactionId]);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // 2. Get the currency conversion rate
    const fiatRate = await getConversionRate(transaction.currency_code);  // Get conversion rate for the user's chosen currency
    
    // 3. Convert coinAmount to fiat
    const fiatAmount = coinAmount * fiatRate;

    // 4. Update the user's wallet balance (both crypto and fiat)
    const updateWalletQuery = `
      UPDATE wallets
      SET balance = balance - ?, fiat_balance = fiat_balance + ?
      WHERE user_id = ? AND coin_type = ?
    `;
    await db.promise().query(updateWalletQuery, [coinAmount, fiatAmount, userId, coinType]);

    // 5. Credit admin wallet with commission based on the transaction (e.g., 1% commission)
    const commissionPercent = 0.01;  // Example: 1% commission
    const adminWalletQuery = 'SELECT * FROM admin_wallets WHERE id = 1';
    const [adminWallet] = await db.promise().query(adminWalletQuery);
    const commissionAmount = fiatAmount * commissionPercent;
    await db.promise().query('UPDATE admin_wallets SET fiat_balance = fiat_balance + ? WHERE id = 1', [commissionAmount]);

    // 6. Update the transaction status to completed
    const updateTransactionQuery = 'UPDATE transactions SET status = "completed" WHERE id = ?';
    await db.promise().query(updateTransactionQuery, [transactionId]);

    console.log('Transaction completed and admin wallet credited');
  } catch (err) {
    console.error('Error processing transaction:', err);
    throw new Error('Error processing transaction');
  }
};

module.exports = {
  processTransaction
};