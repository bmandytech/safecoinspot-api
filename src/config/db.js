const { Sequelize } = require('sequelize');

// Initialize Sequelize with your MySQL connection
const sequelize = new Sequelize('cryptodb', 'root', 'secured16$', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false, // Optional: disable SQL query logging in the console
});

// Test the connection
sequelize.authenticate()
  .then(() => console.log('✅ Database connected successfully!'))
  .catch((err) => console.error('❌ Unable to connect to the database:', err));

module.exports = sequelize;
