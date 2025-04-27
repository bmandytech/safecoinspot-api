const express = require('express');
const router = express.Router();
const { WithdrawalFee } = require('../models');
const authMiddleware = require('../middlewares/authMiddleware');  // Add auth middleware for admin authentication

// Route to set or update withdrawal fees
router.post('/fees/withdraw', authMiddleware, async (req, res) => {
    const { coinType, feeAmount, feeType } = req.body;

    try {
        // Find or create the withdrawal fee entry for the specified coin type
        let fee = await WithdrawalFee.findOne({ where: { coin_type: coinType } });

        if (fee) {
            // Update existing fee entry
            fee.fee_amount = feeAmount;
            fee.fee_type = feeType;
            await fee.save();
        } else {
            // Create a new fee entry
            fee = await WithdrawalFee.create({ coin_type: coinType, fee_amount: feeAmount, fee_type: feeType });
        }

        return res.status(200).json({ message: 'Withdrawal fee updated successfully', fee });
    } catch (error) {
        console.error('Error setting withdrawal fee:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to set or update sending fees
router.post('/fees/send', authMiddleware, async (req, res) => {
    const { coinType, feeAmount, feeType } = req.body;

    try {
        let fee = await SendingFee.findOne({ where: { coin_type: coinType } });

        if (fee) {
            fee.fee_amount = feeAmount;
            fee.fee_type = feeType;
            await fee.save();
        } else {
            fee = await SendingFee.create({ coin_type: coinType, fee_amount: feeAmount, fee_type: feeType });
        }

        return res.status(200).json({ message: 'Sending fee updated successfully', fee });
    } catch (error) {
        console.error('Error setting sending fee:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
