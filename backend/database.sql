-- Create database
CREATE DATABASE IF NOT EXISTS badminton_store;

-- Use the database
USE badminton_store;

-- Create products table (with price and discount_percentage columns)
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    long_description TEXT,
    category VARCHAR(100),
    collection VARCHAR(100),
    type VARCHAR(100) DEFAULT NULL,
    price DECIMAL(10, 2) DEFAULT 0,
    discount_percentage DECIMAL(5, 2) DEFAULT 0,
    out_of_stock BOOLEAN DEFAULT FALSE,
    installment_months INT DEFAULT 0,
    enable_mintpay BOOLEAN DEFAULT FALSE,
    enable_koko BOOLEAN DEFAULT FALSE,
    specs JSON
);

-- Create product_images table
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_main BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Create variants table (with discount_percentage column)
CREATE TABLE IF NOT EXISTS variants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    color VARCHAR(100),
    image_url VARCHAR(255),
    stock INT,
    size VARCHAR(50) DEFAULT NULL, 
    grip_size VARCHAR(50) DEFAULT 'None',
    price DECIMAL(10, 2),
    discount_percentage DECIMAL(5, 2) DEFAULT 0,
    frame_racket ENUM('Frame', 'Racket', 'None') DEFAULT 'None',
    racket_piece ENUM('1 Racket', '2-in-1', 'None') DEFAULT 'None',
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- Create banner_images table for promotional banners
CREATE TABLE IF NOT EXISTS banner_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(255) NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Code to empty the database (if needed)
-- Disable foreign key checks for truncation
-- SET FOREIGN_KEY_CHECKS = 0;

-- Truncate tables to avoid duplicate data
-- TRUNCATE TABLE variants;
-- TRUNCATE TABLE product_images;
-- TRUNCATE TABLE products;
-- TRUNCATE TABLE admin_users;

-- Re-enable foreign key checks
-- SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- PRODUCT INSERTION QUERIES
-- ============================================================================

-- ---------------------------------racket -----------------------------------------------

