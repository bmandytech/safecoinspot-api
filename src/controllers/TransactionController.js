const { Wallet, WithdrawalFee, SendingFee, Transaction } = require('../models');
const { createWallet, createTransaction, getTransactionInfo } = require('../services/coinpaymentsService');

// Helper Function to Deduct Fees
const deductFee = async (userId, coinType, amount, feeType, feeAmount) => {
    try {
        // Find the user's wallet balance
        const wallet = await Wallet.findOne({
            where: { user_id: userId, coin_type: coinType }
        });

        if (!wallet) {
            throw new Error('Wallet not found');
        }

        // Calculate fee based on type (flat or percent)
        let fee;
        if (feeType === 'flat') {
            fee = feeAmount;
        } else if (feeType === 'percent') {
            fee = (amount * feeAmount) / 100;
        }

        // Check if user has enough balance (including fee)
        if (wallet.balance < (amount + fee)) {
            throw new Error('Insufficient funds to cover the amount and fee');
        }

        // Deduct the fee from the wallet
        await wallet.update({ balance: wallet.balance - fee });

        return fee;
    } catch (error) {
        throw new Error(`Error in fee deduction: ${error.message}`);
    }
};

// Function for Withdrawal Transaction (Withdraw to External Wallet)
exports.completeWithdrawal = async (req, res) => {
    const { userId, coinType, amount } = req.body;

    try {
        // Retrieve withdrawal fee for the coin
        const withdrawalFee = await WithdrawalFee.findOne({ where: { coin_type: coinType } });

        if (!withdrawalFee) {
            throw new Error(`No withdrawal fee found for ${coinType}`);
        }

        // Deduct the withdrawal fee from the user's wallet
        const feeAmount = await deductFee(userId, coinType, amount, withdrawalFee.fee_type, withdrawalFee.fee_amount);

        // Record the withdrawal transaction
        const transaction = await Transaction.create({
            user_id: userId,
            type: 'withdrawal',
            amount,
            coin_type: coinType,
            status: 'completed',
            fee: feeAmount  // Store the fee deducted
        });

        return res.status(200).json({ message: 'Withdrawal completed successfully', feeAmount, transaction });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Function for Sending Funds (Internal Wallet Withdrawal)
exports.sendFunds = async (req, res) => {
    const { senderId, recipientId, coinType, amount } = req.body;

    try {
        // Check if the amount exceeds the $500 threshold
        if (amount > 500) {
            // Retrieve sending fee for the coin
            const sendingFee = await SendingFee.findOne({ where: { coin_type: coinType } });

            if (!sendingFee) {
                throw new Error(`No sending fee found for ${coinType}`);
            }

            // Deduct the sending fee from sender's wallet
            const feeAmount = await deductFee(senderId, coinType, amount, sendingFee.fee_type, sendingFee.fee_amount);

            // Record the sending transaction
            const transaction = await Transaction.create({
                user_id: senderId,
                type: 'send',
                amount,
                coin_type: coinType,
                status: 'completed',
                fee: feeAmount  // Store the fee deducted
            });

            return res.status(200).json({ message: 'Funds sent successfully', feeAmount, transaction });
        } else {
            // If amount is less than $500, don't charge a fee
            const transaction = await Transaction.create({
                user_id: senderId,
                type: 'send',
                amount,
                coin_type: coinType,
                status: 'completed',
                fee: 0  // No fee deducted
            });

            return res.status(200).json({ message: 'Funds sent successfully without a fee', transaction });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Function for Scanning Wallet Before Transaction (Check Sufficient Funds)
exports.scanWalletForTransaction = async (userId, coinType, amount) => {
    try {
        const wallet = await Wallet.findOne({
            where: { user_id: userId, coin_type: coinType }
        });

        if (!wallet) {
            throw new Error('Wallet not found');
        }

        // Check if wallet balance is sufficient
        if (wallet.balance < amount) {
            throw new Error('Insufficient balance');
        }

        return wallet;
    } catch (error) {
        throw new Error(`Error scanning wallet: ${error.message}`);
    }
};

// CoinPayments Integration - Create Coin Wallet
exports.createCoinWallet = async (req, res) => {
  const { coinType } = req.body;
  try {
    const wallet = await createWallet(coinType);
    res.status(200).json({ wallet });
  } catch (error) {
    res.status(500).json({ error: 'Error creating wallet', details: error });
  }
};

// CoinPayments Integration - Initiate Transaction
exports.initiateTransaction = async (req, res) => {
  const { amount, coinType, email } = req.body;
  try {
    const transaction = await createTransaction(amount, coinType, email);
    res.status(200).json({ transaction });
  } catch (error) {
    res.status(500).json({ error: 'Error creating transaction', details: error });
  }
};

// CoinPayments Integration - Get Transaction Details
exports.getTransactionDetails = async (req, res) => {
  const { transactionId } = req.params;
  try {
    const transactionInfo = await getTransactionInfo(transactionId);
    res.status(200).json({ transactionInfo });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching transaction info', details: error });
  }
};