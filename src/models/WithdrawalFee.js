const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const WithdrawalFee = sequelize.define('WithdrawalFee', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  coin_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  fee_type: {
    type: DataTypes.STRING(10), // 'flat' or 'percent'
    allowNull: false,
  },
  fee_amount: {
    type: DataTypes.DECIMAL(18, 8),
    allowNull: false,
  },
}, {
  tableName: 'withdrawal_fees',
  timestamps: false,
});

sequelize.sync()
  .then(() => console.log('WithdrawalFee table synced.'))
  .catch(err => console.log('Error syncing WithdrawalFee table: ', err));

module.exports = WithdrawalFee;