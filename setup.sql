-- Create the database
CREATE DATABASE IF NOT EXISTS cryptodb;
USE cryptodb;

-- Users Table (Updated for email, phone verification, and biometric login)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    biometric_data_hash VARCHAR(255),  -- Hash of biometric data (e.g., face scan or fingerprint)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Verification Tokens Table (For email and phone verification)
CREATE TABLE IF NOT EXISTS verification_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    token VARCHAR(255) NOT NULL,
    token_type ENUM('email', 'phone') NOT NULL,  -- Type of verification token (email or phone)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,  -- Expiry date for the token
    verified BOOLEAN DEFAULT FALSE,  -- Whether the token was used successfully
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Login Attempts Table (Track failed login attempts)
CREATE TABLE IF NOT EXISTS login_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    successful BOOLEAN DEFAULT FALSE,  -- Whether the login was successful or failed
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Admin Approval for Withdrawals
CREATE TABLE IF NOT EXISTS withdrawal_approvals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT,
    approved BOOLEAN DEFAULT FALSE,
    admin_id INT,
    approval_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id),
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- Wallets Table
CREATE TABLE IF NOT EXISTS wallets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    coin_type VARCHAR(50),
    balance DECIMAL(18,8) DEFAULT 0.0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    type ENUM('buy', 'sell', 'swap', 'deposit', 'withdrawal') NOT NULL,
    amount DECIMAL(18,8) NOT NULL,
    coin_type VARCHAR(50),
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- P2P Trades Table
CREATE TABLE IF NOT EXISTS p2p_trades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    buyer_id INT,
    seller_id INT,
    coin_type VARCHAR(50),
    amount DECIMAL(18,8) NOT NULL,
    price DECIMAL(18,8) NOT NULL,
    status ENUM('open', 'completed', 'cancelled') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (seller_id) REFERENCES users(id)
);

-- Escrow Fees Table
CREATE TABLE IF NOT EXISTS escrow_fees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coin_type VARCHAR(50) NOT NULL,
    payment_method VARCHAR(100) NOT NULL,
    fee_percent DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(coin_type, payment_method)
);

-- Commission Settings Table
CREATE TABLE IF NOT EXISTS commission_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stage INT NOT NULL, -- 1st level, 2nd level, 3rd level
    percentage DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Withdrawal Fees Table
CREATE TABLE IF NOT EXISTS withdrawal_fees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coin_type VARCHAR(50) NOT NULL,
    fee_amount DECIMAL(18,8) NOT NULL,  -- Can be a flat fee or percentage
    fee_type ENUM('flat', 'percent') DEFAULT 'flat',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (coin_type)
);