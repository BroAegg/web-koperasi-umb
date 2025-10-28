-- ========================================
-- COMPLETE MYSQL DATABASE SCHEMA
-- Koperasi UMB Production Database
-- Generated: October 27, 2025
-- ========================================

-- Database Configuration
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- Use Database (created via cPanel)
-- Database Name: mekh7277_mekarmuk_koperasi
-- Username: mekh7277_bermadani

USE mekh7277_mekarmuk_koperasi;

-- ========================================
-- DROP EXISTING TABLES (if any)
-- ========================================
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `activity_logs`;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `broadcasts`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `consignment_batches`;
DROP TABLE IF EXISTS `consignment_payments`;
DROP TABLE IF EXISTS `consignment_sales`;
DROP TABLE IF EXISTS `consignors`;
DROP TABLE IF EXISTS `loan_payments`;
DROP TABLE IF EXISTS `loans`;
DROP TABLE IF EXISTS `members`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `purchase_items`;
DROP TABLE IF EXISTS `purchases`;
DROP TABLE IF EXISTS `savings`;
DROP TABLE IF EXISTS `settlements`;
DROP TABLE IF EXISTS `stock_movements`;
DROP TABLE IF EXISTS `supplier_payments`;
DROP TABLE IF EXISTS `suppliers`;
DROP TABLE IF EXISTS `transaction_items`;
DROP TABLE IF EXISTS `transactions`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- ========================================
-- CREATE TABLES
-- ========================================

-- Users Table
CREATE TABLE `users` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `role` ENUM('SUPER_ADMIN', 'ADMIN', 'SUPPLIER', 'USER', 'DEVELOPER') NOT NULL DEFAULT 'USER',
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories Table
CREATE TABLE `categories` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL UNIQUE,
  `description` TEXT,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Suppliers Table
CREATE TABLE `suppliers` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `code` VARCHAR(191) NOT NULL UNIQUE,
  `businessName` VARCHAR(191) NOT NULL,
  `ownerName` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password` VARCHAR(191) NOT NULL,
  `address` TEXT NOT NULL,
  `productCategory` VARCHAR(191),
  `description` TEXT,
  `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'ACTIVE') NOT NULL DEFAULT 'PENDING',
  `paymentStatus` ENUM('UNPAID', 'PARTIAL', 'PAID', 'PAID_PENDING_APPROVAL', 'PAID_APPROVED', 'PAID_REJECTED') NOT NULL DEFAULT 'UNPAID',
  `monthlyFee` DECIMAL(10, 2) NOT NULL DEFAULT 25000.00,
  `isPaymentActive` BOOLEAN NOT NULL DEFAULT FALSE,
  `lastPaymentDate` DATETIME(3),
  `nextPaymentDue` DATETIME(3),
  `paymentTerms` VARCHAR(191),
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `approvedById` VARCHAR(191),
  `approvedAt` DATETIME(3),
  `rejectedReason` TEXT,
  `note` TEXT,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products Table
CREATE TABLE `products` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL,
  `description` TEXT,
  `categoryId` VARCHAR(191) NOT NULL,
  `supplierId` VARCHAR(191),
  `sku` VARCHAR(191) UNIQUE,
  `buyPrice` DECIMAL(10, 2),
  `sellPrice` DECIMAL(10, 2) NOT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `threshold` INT NOT NULL DEFAULT 5,
  `unit` VARCHAR(50) NOT NULL DEFAULT 'pcs',
  `ownershipType` ENUM('TOKO', 'TITIPAN') NOT NULL DEFAULT 'TOKO',
  `stockCycle` ENUM('HARIAN', 'MINGGUAN', 'DUA_MINGGUAN') NOT NULL DEFAULT 'MINGGUAN',
  `status` ENUM('ACTIVE', 'INACTIVE', 'SEASONAL') NOT NULL DEFAULT 'ACTIVE',
  `isConsignment` BOOLEAN NOT NULL DEFAULT FALSE,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `avgCost` DECIMAL(10, 2),
  `expiryPolicy` VARCHAR(191),
  `supplierContact` VARCHAR(191),
  `lastRestockAt` DATETIME(3),
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`),
  FOREIGN KEY (`supplierId`) REFERENCES `suppliers`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Members Table
CREATE TABLE `members` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `userId` VARCHAR(191) NOT NULL UNIQUE,
  `nomorAnggota` VARCHAR(191) NOT NULL UNIQUE,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `phone` VARCHAR(191),
  `address` TEXT,
  `gender` ENUM('MALE', 'FEMALE') NOT NULL,
  `unitKerja` VARCHAR(191) NOT NULL,
  `joinDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  `simpananPokok` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `simpananWajib` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `simpananSukarela` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transactions Table
CREATE TABLE `transactions` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `memberId` VARCHAR(191),
  `type` ENUM('SALE', 'PURCHASE', 'RETURN', 'INCOME', 'EXPENSE') NOT NULL,
  `totalAmount` DECIMAL(15, 2) NOT NULL,
  `paymentMethod` ENUM('CASH', 'TRANSFER', 'CREDIT') NOT NULL DEFAULT 'CASH',
  `status` ENUM('PENDING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'COMPLETED',
  `note` TEXT,
  `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `isProduction` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (`memberId`) REFERENCES `members`(`id`),
  INDEX `idx_transactions_production` (`isProduction`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transaction Items Table
CREATE TABLE `transaction_items` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `transactionId` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `quantity` INT NOT NULL,
  `unitPrice` DECIMAL(10, 2) NOT NULL,
  `totalPrice` DECIMAL(15, 2) NOT NULL,
  `cogsPerUnit` DECIMAL(10, 2),
  `totalCogs` DECIMAL(15, 2),
  `grossProfit` DECIMAL(15, 2),
  `isProduction` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`),
  INDEX `idx_transaction_items_product` (`productId`),
  INDEX `idx_transaction_items_transaction` (`transactionId`),
  INDEX `idx_transaction_items_production` (`isProduction`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stock Movements Table
CREATE TABLE `stock_movements` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `productId` VARCHAR(191) NOT NULL,
  `quantity` INT NOT NULL,
  `movementType` ENUM('PURCHASE_IN', 'CONSIGNMENT_IN', 'SALE_OUT', 'RETURN_IN', 'RETURN_OUT', 'EXPIRED_OUT', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT') NOT NULL,
  `referenceType` ENUM('PURCHASE', 'CONSIGNMENT_BATCH', 'SALE', 'ADJUSTMENT', 'EXPIRY'),
  `referenceId` VARCHAR(191),
  `unitCost` DECIMAL(10, 2),
  `note` TEXT,
  `occurredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `isProduction` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  INDEX `idx_stock_movements_product_date` (`productId`, `occurredAt`),
  INDEX `idx_stock_movements_reference` (`referenceType`, `referenceId`),
  INDEX `idx_stock_movements_production` (`isProduction`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Purchases Table
CREATE TABLE `purchases` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `code` VARCHAR(191) NOT NULL UNIQUE,
  `supplierId` VARCHAR(191) NOT NULL,
  `totalAmount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `purchaseDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `receivedDate` DATETIME(3),
  `status` ENUM('PENDING', 'RECEIVED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  `paymentStatus` ENUM('UNPAID', 'PARTIAL', 'PAID', 'PAID_PENDING_APPROVAL', 'PAID_APPROVED', 'PAID_REJECTED') NOT NULL DEFAULT 'UNPAID',
  `paymentDate` DATETIME(3),
  `note` TEXT,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (`supplierId`) REFERENCES `suppliers`(`id`),
  INDEX `idx_purchases_supplier_date` (`supplierId`, `purchaseDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Purchase Items Table
CREATE TABLE `purchase_items` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `purchaseId` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `quantity` INT NOT NULL,
  `unitCost` DECIMAL(10, 2) NOT NULL,
  `totalCost` DECIMAL(15, 2) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (`purchaseId`) REFERENCES `purchases`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`),
  INDEX `idx_purchase_items_product` (`productId`),
  INDEX `idx_purchase_items_purchase` (`purchaseId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Consignors Table
CREATE TABLE `consignors` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `code` VARCHAR(191) NOT NULL UNIQUE,
  `name` VARCHAR(191) NOT NULL,
  `contact` VARCHAR(191),
  `phone` VARCHAR(191),
  `email` VARCHAR(191),
  `address` TEXT,
  `feeType` ENUM('PERCENTAGE', 'FLAT', 'HYBRID') NOT NULL DEFAULT 'PERCENTAGE',
  `defaultFeePercent` DECIMAL(5, 2),
  `defaultFeeFlat` DECIMAL(10, 2),
  `paymentSchedule` VARCHAR(191),
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `note` TEXT,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Consignment Batches Table
CREATE TABLE `consignment_batches` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `code` VARCHAR(191) NOT NULL UNIQUE,
  `consignorId` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `qtyIn` INT NOT NULL,
  `qtySold` INT NOT NULL DEFAULT 0,
  `qtyReturned` INT NOT NULL DEFAULT 0,
  `qtyExpired` INT NOT NULL DEFAULT 0,
  `qtyRemaining` INT NOT NULL,
  `feeType` ENUM('PERCENTAGE', 'FLAT', 'HYBRID') NOT NULL,
  `feePercent` DECIMAL(5, 2),
  `feeFlat` DECIMAL(10, 2),
  `receivedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `expiryAt` DATETIME(3),
  `status` ENUM('ACTIVE', 'DEPLETED', 'RETURNED', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE',
  `note` TEXT,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (`consignorId`) REFERENCES `consignors`(`id`),
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`),
  INDEX `idx_consignment_batches_consignor_date` (`consignorId`, `receivedAt`),
  INDEX `idx_consignment_batches_product_status` (`productId`, `status`),
  INDEX `idx_consignment_batches_received` (`receivedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Consignment Sales Table
CREATE TABLE `consignment_sales` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `batchId` VARCHAR(191) NOT NULL,
  `transactionItemId` VARCHAR(191) NOT NULL,
  `qtySold` INT NOT NULL,
  `unitPrice` DECIMAL(10, 2) NOT NULL,
  `totalRevenue` DECIMAL(15, 2) NOT NULL,
  `feeType` ENUM('PERCENTAGE', 'FLAT', 'HYBRID') NOT NULL,
  `feeAmount` DECIMAL(15, 2) NOT NULL,
  `netToConsignor` DECIMAL(15, 2) NOT NULL,
  `settlementId` VARCHAR(191),
  `isSettled` BOOLEAN NOT NULL DEFAULT FALSE,
  `saleDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `isProduction` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (`batchId`) REFERENCES `consignment_batches`(`id`),
  FOREIGN KEY (`transactionItemId`) REFERENCES `transaction_items`(`id`),
  INDEX `idx_consignment_sales_batch` (`batchId`),
  INDEX `idx_consignment_sales_date` (`saleDate`),
  INDEX `idx_consignment_sales_settlement` (`settlementId`),
  INDEX `idx_consignment_sales_production` (`isProduction`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Settlements Table
CREATE TABLE `settlements` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `code` VARCHAR(191) NOT NULL UNIQUE,
  `consignorId` VARCHAR(191) NOT NULL,
  `periodStart` DATETIME(3) NOT NULL,
  `periodEnd` DATETIME(3) NOT NULL,
  `totalRevenue` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `totalFee` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `totalPayable` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `status` ENUM('PENDING', 'PAID', 'CANCELLED', 'DISPUTED') NOT NULL DEFAULT 'PENDING',
  `paymentMethod` ENUM('CASH', 'TRANSFER', 'CREDIT'),
  `paymentDate` DATETIME(3),
  `paymentRef` VARCHAR(191),
  `note` TEXT,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (`consignorId`) REFERENCES `consignors`(`id`),
  INDEX `idx_settlements_consignor_period` (`consignorId`, `periodStart`),
  INDEX `idx_settlements_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key for settlements in consignment_sales
ALTER TABLE `consignment_sales` 
ADD CONSTRAINT `fk_consignment_sales_settlement` 
FOREIGN KEY (`settlementId`) REFERENCES `settlements`(`id`);

-- Supplier Payments Table
CREATE TABLE `supplier_payments` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `supplierId` VARCHAR(191) NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `paymentMethod` ENUM('CASH', 'TRANSFER', 'CREDIT') NOT NULL DEFAULT 'TRANSFER',
  `paymentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `periodStart` DATETIME(3) NOT NULL,
  `periodEnd` DATETIME(3) NOT NULL,
  `referenceNo` VARCHAR(191),
  `paymentProof` TEXT,
  `status` ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  `verifiedBy` VARCHAR(191),
  `verifiedAt` DATETIME(3),
  `note` TEXT,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (`supplierId`) REFERENCES `suppliers`(`id`) ON DELETE CASCADE,
  INDEX `idx_supplier_payments_supplier_date` (`supplierId`, `paymentDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Consignment Payments Table
CREATE TABLE `consignment_payments` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `supplierId` VARCHAR(191),
  `supplierName` VARCHAR(191) NOT NULL,
  `amount` DOUBLE NOT NULL,
  `period` VARCHAR(191) NOT NULL,
  `periodStart` DATETIME(3) NOT NULL,
  `periodEnd` DATETIME(3) NOT NULL,
  `paymentMethod` ENUM('CASH', 'TRANSFER', 'CREDIT') NOT NULL DEFAULT 'CASH',
  `transactionId` VARCHAR(191) UNIQUE,
  `paidBy` VARCHAR(191) NOT NULL,
  `status` ENUM('PENDING', 'APPROVED', 'PAID', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  `accountNumber` VARCHAR(191),
  `bankName` VARCHAR(191),
  `proofImageUrl` TEXT,
  `requestedBy` VARCHAR(191),
  `requestedAt` DATETIME(3),
  `reviewedBy` VARCHAR(191),
  `reviewedAt` DATETIME(3),
  `rejectedReason` TEXT,
  `note` TEXT,
  `metadata` JSON,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (`supplierId`) REFERENCES `suppliers`(`id`),
  FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`),
  FOREIGN KEY (`paidBy`) REFERENCES `users`(`id`),
  INDEX `idx_consignment_payments_supplier` (`supplierId`),
  INDEX `idx_consignment_payments_status` (`status`),
  INDEX `idx_consignment_payments_created` (`createdAt`),
  INDEX `idx_consignment_payments_period` (`periodStart`, `periodEnd`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Loans Table
CREATE TABLE `loans` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `memberId` VARCHAR(191) NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `interestRate` DECIMAL(5, 2) NOT NULL,
  `tenor` INT NOT NULL,
  `monthlyPayment` DECIMAL(15, 2) NOT NULL,
  `remainingAmount` DECIMAL(15, 2) NOT NULL,
  `status` ENUM('ACTIVE', 'COMPLETED', 'OVERDUE') NOT NULL DEFAULT 'ACTIVE',
  `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `endDate` DATETIME(3) NOT NULL,
  `description` TEXT,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Loan Payments Table
CREATE TABLE `loan_payments` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `loanId` VARCHAR(191) NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `paymentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `description` TEXT,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (`loanId`) REFERENCES `loans`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Savings Table
CREATE TABLE `savings` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `memberId` VARCHAR(191) NOT NULL,
  `type` ENUM('POKOK', 'WAJIB', 'SUKARELA', 'WITHDRAWAL') NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `description` TEXT,
  `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Broadcasts Table
CREATE TABLE `broadcasts` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `title` VARCHAR(191) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('ANNOUNCEMENT', 'URGENT', 'INFO', 'REMINDER') NOT NULL,
  `targetAudience` ENUM('ALL', 'ACTIVE_MEMBERS', 'UNIT_SPECIFIC') NOT NULL,
  `unitTarget` VARCHAR(191),
  `status` ENUM('DRAFT', 'SCHEDULED', 'SENT', 'FAILED') NOT NULL DEFAULT 'DRAFT',
  `scheduledAt` DATETIME(3),
  `sentAt` DATETIME(3),
  `totalRecipients` INT NOT NULL DEFAULT 0,
  `successfulDeliveries` INT NOT NULL DEFAULT 0,
  `failedDeliveries` INT NOT NULL DEFAULT 0,
  `createdById` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (`createdById`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity Logs Table
CREATE TABLE `activity_logs` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `userId` VARCHAR(191) NOT NULL,
  `userRole` ENUM('SUPER_ADMIN', 'ADMIN', 'SUPPLIER', 'USER', 'DEVELOPER') NOT NULL,
  `action` VARCHAR(191) NOT NULL,
  `module` VARCHAR(191) NOT NULL,
  `description` TEXT NOT NULL,
  `metadata` JSON,
  `ipAddress` VARCHAR(191),
  `userAgent` TEXT,
  `isProduction` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_activity_logs_user` (`userId`),
  INDEX `idx_activity_logs_role` (`userRole`),
  INDEX `idx_activity_logs_module` (`module`),
  INDEX `idx_activity_logs_action` (`action`),
  INDEX `idx_activity_logs_production` (`isProduction`),
  INDEX `idx_activity_logs_created` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit Logs Table
CREATE TABLE `audit_logs` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `userId` VARCHAR(191),
  `action` VARCHAR(191) NOT NULL,
  `entity` VARCHAR(191) NOT NULL,
  `entityId` VARCHAR(191),
  `oldData` TEXT,
  `newData` TEXT,
  `ipAddress` VARCHAR(191),
  `userAgent` TEXT,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- INSERT INITIAL DATA
-- ========================================

-- Insert Super Admin
-- Password: Admin@UMB2025! (bcrypt hash)
INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`, `isActive`, `createdAt`, `updatedAt`) VALUES
('superadmin-001', 'admin@koperasi-umb.ac.id', '$2a$10$YPZ8qH7vKqX9LjN8CZkQnOQkP6Y8wR9vH5LmN3pQ8xR6wT9yU1vZ2', 'Super Admin UMB', 'SUPER_ADMIN', TRUE, NOW(), NOW())
ON DUPLICATE KEY UPDATE `email` = `email`;

-- Insert Categories
INSERT INTO `categories` (`id`, `name`, `description`, `createdAt`, `updatedAt`) VALUES
('cat-001', 'Makanan & Minuman', 'Kategori makanan dan minuman', NOW(), NOW()),
('cat-002', 'Perlengkapan Kantor', 'Alat tulis dan perlengkapan kantor', NOW(), NOW()),
('cat-003', 'Elektronik', 'Barang elektronik', NOW(), NOW()),
('cat-004', 'Kesehatan', 'Produk kesehatan dan kebersihan', NOW(), NOW()),
('cat-005', 'Lainnya', 'Kategori lain-lain', NOW(), NOW())
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ========================================
-- POST-INSTALL VERIFICATION
-- ========================================

-- Check tables created
SELECT COUNT(*) as total_tables FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE';

-- Check admin user
SELECT id, email, name, role FROM users WHERE role = 'SUPER_ADMIN';

-- Check categories
SELECT id, name FROM categories;

-- ========================================
-- IMPORTANT NOTES
-- ========================================

/*
1. SUPER ADMIN LOGIN:
   Email: admin@koperasi-umb.ac.id
   Password: Admin@UMB2025!
   
   ⚠️ CHANGE PASSWORD IMMEDIATELY AFTER FIRST LOGIN!

2. UPDATE .env FILE:
   DATABASE_URL="mysql://mekarmuk_admin:YOUR_PASSWORD@localhost:3306/mekarmuk_koperasi"

3. PRISMA SETUP:
   - Copy prisma folder to server
   - Update schema.prisma: change provider to "mysql"
   - Run: npx prisma generate
   - Verify connection: npx prisma db pull

4. FILE PERMISSIONS:
   - .env file: chmod 600
   - node_modules: chmod 755
   - All files: chown cpanel_user:cpanel_user

5. BACKUP COMMAND:
   mysqldump -u mekarmuk_admin -p mekarmuk_koperasi > backup_$(date +%Y%m%d).sql

6. RESTORE COMMAND:
   mysql -u mekarmuk_admin -p mekarmuk_koperasi < backup_file.sql
*/
