const Wallet = require('../models/Wallet'); // Import the Wallet model

// Create a new wallet for a user
exports.createWallet = (userId, coinType) => {
    return Wallet.findOne({
        where: {
            user_id: userId,
            coin_type: coinType
        }
    })
    .then(existingWallet => {
        if (existingWallet) {
            throw new Error('Wallet already exists for this coin type');
        }
        return Wallet.create({
            user_id: userId,
            coin_type: coinType,
            balance: 0.0 // Set balance to 0.0 by default
        });
    })
    .then(newWallet => {
        return newWallet; // Return the newly created wallet
    })
    .catch(err => {
        throw new Error('Error creating wallet: ' + err.message);
    });
};

// Get wallet balance for a specific coin type
exports.getBalance = (userId, coinType) => {
    return Wallet.findOne({
        where: {
            user_id: userId,
            coin_type: coinType
        }
    })
    .then(wallet => {
        if (wallet) {
            return wallet.balance; // Return the balance
        } else {
            throw new Error('Wallet not found');
        }
    })
    .catch(err => {
        throw new Error('Error retrieving wallet balance: ' + err.message);
    });
};

// Update the balance of a specific wallet (e.g., after a transaction)
exports.updateBalance = (userId, coinType, newBalance) => {
    return Wallet.findOne({
        where: {
            user_id: userId,
            coin_type: coinType
        }
    })
    .then(wallet => {
        if (!wallet) {
            throw new Error('Wallet not found');
        }
        return wallet.update({ balance: newBalance }); // Update the wallet's balance
    })
    .then(updatedWallet => {
        return 'Balance updated successfully';
    })
    .catch(err => {
        throw new Error('Error updating wallet balance: ' + err.message);
    });
};
