// controllers/withdrawalFeeController.js
const { WithdrawalFee } = require('../models');

exports.createOrUpdateWithdrawalFee = async (req, res) => {
  try {
    const { coin_type, fee_amount, fee_type } = req.body;

    const [fee, created] = await WithdrawalFee.upsert({
      coin_type,
      fee_amount,
      fee_type
    });

    return res.status(200).json({
      message: created ? 'Withdrawal fee created' : 'Withdrawal fee updated',
      data: fee
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getWithdrawalFees = async (req, res) => {
  try {
    const fees = await WithdrawalFee.findAll();
    return res.status(200).json({ data: fees });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
