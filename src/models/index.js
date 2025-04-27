const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Make sure this points to your db config file

// Import model definitions
const Wallet = require('./Wallet');
const WithdrawalFee = require('./WithdrawalFee');
const SendingFee = require('./SendingFee');
const Transaction = require('./Transaction');

// Optional: define model associations here if needed
// Example:
// Wallet.hasMany(Transaction, { foreignKey: 'user_id' });
// Transaction.belongsTo(Wallet, { foreignKey: 'user_id' });

// Export all models and Sequelize instance
module.exports = {
  sequelize,
  Sequelize,
  Wallet,
  WithdrawalFee,
  SendingFee,
  Transaction,
};