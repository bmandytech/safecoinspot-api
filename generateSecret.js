const crypto = require('crypto');

const secret = crypto.randomBytes(64).toString('hex');
console.log(secret);  // This will print the secret key
