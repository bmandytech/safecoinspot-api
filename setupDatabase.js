const mysql = require('mysql2');
const fs = require('fs');

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Replace with your MySQL username
  password: 'secured16$', // Replace with your MySQL password
  database: 'cryptodb' // Ensure this is the correct database name
});

// Read the SQL code from a file or directly include it as a string
const sqlCode = fs.readFileSync('setup.sql', 'utf8');  // Assuming you saved the SQL code in setup.sql

// Execute the SQL code
connection.query(sqlCode, (err, results) => {
  if (err) {
    console.error('Error executing SQL:', err);
    return;
  }
  console.log('Database setup complete:', results);
  connection.end();
});
