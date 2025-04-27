const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING(20), // 'send', 'withdrawal', etc.
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(18, 8),
    allowNull: false,
  },
  coin_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pending',
  },
  fee: {
    type: DataTypes.DECIMAL(18, 8),
    defaultValue: 0.0,
  },
}, {
  tableName: 'transactions',
  timestamps: false,
});

sequelize.sync()
  .then(() => console.log('Transaction table synced.'))
  .catch(err => console.log('Error syncing Transaction table: ', err));

module.exports = Transaction;