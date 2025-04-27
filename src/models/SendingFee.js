const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SendingFee = sequelize.define('SendingFee', {
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
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  fee_amount: {
    type: DataTypes.DECIMAL(18, 8),
    allowNull: false,
  },
}, {
  tableName: 'sending_fees',
  timestamps: false,
});

sequelize.sync()
  .then(() => console.log('SendingFee table synced.'))
  .catch(err => console.log('Error syncing SendingFee table: ', err));

module.exports = SendingFee;