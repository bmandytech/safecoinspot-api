const { Sequelize } = require('sequelize');

// Initialize Sequelize with your MySQL connection
const sequelize = new Sequelize({
  host: 'localhost',
  dialect: 'mysql',
  username: 'root', // MySQL username
  password: 'secured16$', // MySQL password
  database: 'cryptodb', // Database name
});

// Test the connection
sequelize.authenticate()
  .then(() => console.log('Database connected!'))
  .catch(err => console.error('Unable to connect to the database:', err));

module.exports = sequelize;