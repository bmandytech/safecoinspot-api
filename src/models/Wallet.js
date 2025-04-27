const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Ensure this points to your Sequelize instance

const Wallet = sequelize.define('Wallet', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  coin_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  balance: {
    type: DataTypes.DECIMAL(18, 8),
    defaultValue: 0.0,
  },
}, {
  tableName: 'wallets',
  timestamps: false,
});

module.exports = Wallet;