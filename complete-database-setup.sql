-- 🚀 KOPERASI UMB DATABASE SCHEMA - PRODUCTION READY
-- Generated for mekarmukti.id deployment
-- Run this entire script in cPanel phpMyAdmin

-- Create database and user
CREATE DATABASE IF NOT EXISTS mekh7277_koperasi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'mekh7277_admin'@'localhost' IDENTIFIED BY 'KoperasiUMB2025!';
GRANT ALL PRIVILEGES ON mekh7277_koperasi.* TO 'mekh7277_admin'@'localhost';
FLUSH PRIVILEGES;

-- Use the database
USE mekh7277_koperasi;

-- Users table
CREATE TABLE User (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  email VARCHAR(191) NOT NULL UNIQUE,
  name VARCHAR(191) NOT NULL,
  password VARCHAR(191) NOT NULL,
  role ENUM('SUPER_ADMIN', 'ADMIN', 'KASIR', 'SUPPLIER') NOT NULL DEFAULT 'KASIR',
  isActive BOOLEAN NOT NULL DEFAULT true,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

-- Categories table
CREATE TABLE Category (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  description VARCHAR(191),
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

-- Suppliers table
CREATE TABLE Supplier (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  businessName VARCHAR(191) NOT NULL,
  contactPerson VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  phone VARCHAR(191) NOT NULL,
  address TEXT NOT NULL,
  status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  totalDebt DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

-- Products table
CREATE TABLE Product (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  description TEXT,
  barcode VARCHAR(191) UNIQUE,
  categoryId VARCHAR(191) NOT NULL,
  supplierId VARCHAR(191),
  purchasePrice DECIMAL(10,2) NOT NULL,
  sellingPrice DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  minStock INTEGER NOT NULL DEFAULT 0,
  isActive BOOLEAN NOT NULL DEFAULT true,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (categoryId) REFERENCES Category(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (supplierId) REFERENCES Supplier(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Transactions table
CREATE TABLE Transaction (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  type ENUM('SALE', 'EXPENSE') NOT NULL DEFAULT 'SALE',
  totalAmount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  userId VARCHAR(191) NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Transaction Items table
CREATE TABLE TransactionItem (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  transactionId VARCHAR(191) NOT NULL,
  productId VARCHAR(191) NOT NULL,
  quantity INTEGER NOT NULL,
  unitPrice DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (transactionId) REFERENCES Transaction(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Stock Movements table
CREATE TABLE StockMovement (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  productId VARCHAR(191) NOT NULL,
  type ENUM('IN', 'OUT', 'ADJUSTMENT') NOT NULL,
  quantity INTEGER NOT NULL,
  notes TEXT,
  userId VARCHAR(191) NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Activity Logs table
CREATE TABLE ActivityLog (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  action VARCHAR(191) NOT NULL,
  description TEXT NOT NULL,
  userId VARCHAR(191),
  ipAddress VARCHAR(45),
  userAgent TEXT,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Insert default admin user (password: admin123)
INSERT INTO User (id, email, name, password, role) VALUES 
('admin-001', 'admin@mekarmukti.id', 'Super Admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3iJG/8k0i.', 'SUPER_ADMIN');

-- Insert default categories
INSERT INTO Category (id, name, description) VALUES 
('cat-001', 'Makanan', 'Produk makanan dan minuman'),
('cat-002', 'Minuman', 'Berbagai jenis minuman'),
('cat-003', 'Snack', 'Makanan ringan dan camilan'),
('cat-004', 'Kebutuhan Pokok', 'Sembako dan kebutuhan sehari-hari'),
('cat-005', 'Elektronik', 'Barang elektronik dan aksesoris');

-- Insert sample supplier
INSERT INTO Supplier (id, businessName, contactPerson, email, phone, address, status) VALUES 
('sup-001', 'PT Sumber Rejeki', 'Budi Santoso', 'budi@sumberrejeki.com', '081234567890', 'Jl. Raya Jakarta No. 123, Jakarta', 'APPROVED');

-- Insert sample products
INSERT INTO Product (id, name, description, barcode, categoryId, supplierId, purchasePrice, sellingPrice, stock, minStock) VALUES 
('prod-001', 'Indomie Goreng', 'Mie instan rasa ayam goreng', '8999999001234', 'cat-001', 'sup-001', 2500.00, 3000.00, 100, 10),
('prod-002', 'Aqua 600ml', 'Air mineral kemasan 600ml', '8999999005678', 'cat-002', 'sup-001', 3000.00, 4000.00, 50, 5),
('prod-003', 'Chitato Rasa Sapi Panggang', 'Keripik kentang rasa sapi panggang', '8999999009012', 'cat-003', 'sup-001', 8000.00, 10000.00, 25, 5);

COMMIT;

-- Verify installation
SELECT 'Database setup completed successfully!' as status;
SELECT COUNT(*) as user_count FROM User;
SELECT COUNT(*) as category_count FROM Category;
SELECT COUNT(*) as product_count FROM Product;