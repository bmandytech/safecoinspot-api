// src/config/db.js

const { Sequelize } = require('sequelize');

// Define your database connection using Sequelize
const sequelize = new Sequelize({
  dialect: 'mysql', // or 'postgres', 'sqlite', etc.
  host: process.env.DB_HOST || 'localhost',  // or your remote DB host
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crypto_db',  // Use your actual database name here
  logging: false,  // Disable logging SQL queries (can be enabled for debugging)
});

module.exports = sequelize;
