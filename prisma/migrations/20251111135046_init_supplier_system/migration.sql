-- CreateTable
CREATE TABLE `audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `entity` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NULL,
    `oldData` VARCHAR(191) NULL,
    `newData` VARCHAR(191) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `audit_logs_action_createdAt_idx`(`action`, `createdAt`),
    INDEX `audit_logs_entity_createdAt_idx`(`entity`, `createdAt`),
    INDEX `audit_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activity_logs` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `userRole` ENUM('SUPER_ADMIN', 'ADMIN', 'SUPPLIER', 'USER', 'DEVELOPER') NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `module` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `metadata` JSON NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `isProduction` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `activity_logs_userId_idx`(`userId`),
    INDEX `activity_logs_userRole_idx`(`userRole`),
    INDEX `activity_logs_module_idx`(`module`),
    INDEX `activity_logs_action_idx`(`action`),
    INDEX `activity_logs_isProduction_idx`(`isProduction`),
    INDEX `activity_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `broadcasts` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `type` ENUM('ANNOUNCEMENT', 'URGENT', 'INFO', 'REMINDER') NOT NULL,
    `targetAudience` ENUM('ALL', 'ACTIVE_MEMBERS', 'UNIT_SPECIFIC') NOT NULL,
    `unitTarget` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'SCHEDULED', 'SENT', 'FAILED') NOT NULL DEFAULT 'DRAFT',
    `scheduledAt` DATETIME(3) NULL,
    `sentAt` DATETIME(3) NULL,
    `totalRecipients` INTEGER NOT NULL DEFAULT 0,
    `successfulDeliveries` INTEGER NOT NULL DEFAULT 0,
    `failedDeliveries` INTEGER NOT NULL DEFAULT 0,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `icon` VARCHAR(191) NULL DEFAULT '📦',
    `order` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `categories_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `consignment_batches` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `consignorId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `qtyIn` INTEGER NOT NULL,
    `qtySold` INTEGER NOT NULL DEFAULT 0,
    `qtyReturned` INTEGER NOT NULL DEFAULT 0,
    `qtyExpired` INTEGER NOT NULL DEFAULT 0,
    `qtyRemaining` INTEGER NOT NULL,
    `feeType` ENUM('PERCENTAGE', 'FLAT', 'HYBRID') NOT NULL,
    `feePercent` DECIMAL(65, 30) NULL,
    `feeFlat` DECIMAL(65, 30) NULL,
    `receivedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiryAt` DATETIME(3) NULL,
    `status` ENUM('ACTIVE', 'DEPLETED', 'RETURNED', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE',
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `consignment_batches_code_key`(`code`),
    INDEX `consignment_batches_consignorId_receivedAt_idx`(`consignorId`, `receivedAt`),
    INDEX `consignment_batches_productId_status_idx`(`productId`, `status`),
    INDEX `consignment_batches_receivedAt_idx`(`receivedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `consignment_sales` (
    `id` VARCHAR(191) NOT NULL,
    `batchId` VARCHAR(191) NOT NULL,
    `transactionItemId` VARCHAR(191) NOT NULL,
    `qtySold` INTEGER NOT NULL,
    `unitPrice` DECIMAL(65, 30) NOT NULL,
    `totalRevenue` DECIMAL(65, 30) NOT NULL,
    `feeType` ENUM('PERCENTAGE', 'FLAT', 'HYBRID') NOT NULL,
    `feeAmount` DECIMAL(65, 30) NOT NULL,
    `netToConsignor` DECIMAL(65, 30) NOT NULL,
    `settlementId` VARCHAR(191) NULL,
    `isSettled` BOOLEAN NOT NULL DEFAULT false,
    `saleDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isProduction` BOOLEAN NOT NULL DEFAULT true,

    INDEX `consignment_sales_batchId_idx`(`batchId`),
    INDEX `consignment_sales_saleDate_idx`(`saleDate`),
    INDEX `consignment_sales_settlementId_idx`(`settlementId`),
    INDEX `consignment_sales_isProduction_idx`(`isProduction`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `consignment_payments` (
    `id` VARCHAR(191) NOT NULL,
    `supplierId` VARCHAR(191) NULL,
    `supplierName` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `period` VARCHAR(191) NOT NULL,
    `periodStart` DATETIME(3) NOT NULL,
    `periodEnd` DATETIME(3) NOT NULL,
    `paymentMethod` ENUM('CASH', 'TRANSFER', 'CREDIT') NOT NULL DEFAULT 'CASH',
    `transactionId` VARCHAR(191) NULL,
    `paidBy` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `accountNumber` VARCHAR(191) NULL,
    `bankName` VARCHAR(191) NULL,
    `proofImageUrl` VARCHAR(191) NULL,
    `rejectedReason` VARCHAR(191) NULL,
    `requestedAt` DATETIME(3) NULL,
    `requestedBy` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `reviewedBy` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'PAID', 'REJECTED') NOT NULL DEFAULT 'PENDING',

    UNIQUE INDEX `consignment_payments_transactionId_key`(`transactionId`),
    INDEX `consignment_payments_supplierId_idx`(`supplierId`),
    INDEX `consignment_payments_status_idx`(`status`),
    INDEX `consignment_payments_createdAt_idx`(`createdAt`),
    INDEX `consignment_payments_periodStart_periodEnd_idx`(`periodStart`, `periodEnd`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `consignors` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `contact` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `feeType` ENUM('PERCENTAGE', 'FLAT', 'HYBRID') NOT NULL DEFAULT 'PERCENTAGE',
    `defaultFeePercent` DECIMAL(65, 30) NULL,
    `defaultFeeFlat` DECIMAL(65, 30) NULL,
    `paymentSchedule` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `consignors_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loan_payments` (
    `id` VARCHAR(191) NOT NULL,
    `loanId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `paymentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loans` (
    `id` VARCHAR(191) NOT NULL,
    `memberId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `interestRate` DECIMAL(65, 30) NOT NULL,
    `tenor` INTEGER NOT NULL,
    `monthlyPayment` DECIMAL(65, 30) NOT NULL,
    `remainingAmount` DECIMAL(65, 30) NOT NULL,
    `status` ENUM('ACTIVE', 'COMPLETED', 'OVERDUE') NOT NULL DEFAULT 'ACTIVE',
    `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endDate` DATETIME(3) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `members` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `nomorAnggota` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `gender` ENUM('MALE', 'FEMALE') NOT NULL,
    `unitKerja` VARCHAR(191) NOT NULL,
    `joinDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    `simpananPokok` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `simpananWajib` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `simpananSukarela` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `points` INTEGER NOT NULL DEFAULT 0,
    `tier` ENUM('BRONZE', 'SILVER', 'GOLD', 'PLATINUM') NOT NULL DEFAULT 'BRONZE',
    `totalSpent` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `lastPurchase` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `members_userId_key`(`userId`),
    UNIQUE INDEX `members_nomorAnggota_key`(`nomorAnggota`),
    UNIQUE INDEX `members_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NULL,
    `buyPrice` DECIMAL(65, 30) NULL,
    `sellPrice` DECIMAL(65, 30) NOT NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `threshold` INTEGER NOT NULL DEFAULT 5,
    `unit` VARCHAR(191) NOT NULL DEFAULT 'pcs',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `avgCost` DECIMAL(65, 30) NULL,
    `expiryPolicy` VARCHAR(191) NULL,
    `isConsignment` BOOLEAN NOT NULL DEFAULT false,
    `lastRestockAt` DATETIME(3) NULL,
    `ownershipType` ENUM('TOKO', 'TITIPAN') NOT NULL DEFAULT 'TOKO',
    `status` ENUM('ACTIVE', 'INACTIVE', 'SEASONAL') NOT NULL DEFAULT 'ACTIVE',
    `stockCycle` ENUM('HARIAN', 'MINGGUAN', 'DUA_MINGGUAN') NOT NULL DEFAULT 'MINGGUAN',
    `supplierContact` VARCHAR(191) NULL,
    `supplierId` VARCHAR(191) NULL,
    `profitShareRate` DECIMAL(65, 30) NULL DEFAULT 90.00,

    UNIQUE INDEX `products_sku_key`(`sku`),
    INDEX `products_categoryId_idx`(`categoryId`),
    INDEX `products_supplierId_idx`(`supplierId`),
    INDEX `products_isActive_idx`(`isActive`),
    INDEX `products_name_idx`(`name`),
    INDEX `products_createdAt_idx`(`createdAt`),
    INDEX `products_stock_idx`(`stock`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchase_items` (
    `id` VARCHAR(191) NOT NULL,
    `purchaseId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unitCost` DECIMAL(65, 30) NOT NULL,
    `totalCost` DECIMAL(65, 30) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `purchase_items_productId_idx`(`productId`),
    INDEX `purchase_items_purchaseId_idx`(`purchaseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchases` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `supplierId` VARCHAR(191) NOT NULL,
    `totalAmount` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `purchaseDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `receivedDate` DATETIME(3) NULL,
    `status` ENUM('PENDING', 'RECEIVED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `paymentStatus` ENUM('UNPAID', 'PARTIAL', 'PAID', 'PAID_PENDING_APPROVAL', 'PAID_APPROVED', 'PAID_REJECTED') NOT NULL DEFAULT 'UNPAID',
    `paymentDate` DATETIME(3) NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `purchases_code_key`(`code`),
    INDEX `purchases_supplierId_purchaseDate_idx`(`supplierId`, `purchaseDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `savings` (
    `id` VARCHAR(191) NOT NULL,
    `memberId` VARCHAR(191) NOT NULL,
    `type` ENUM('POKOK', 'WAJIB', 'SUKARELA', 'WITHDRAWAL') NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `description` VARCHAR(191) NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settlements` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `consignorId` VARCHAR(191) NOT NULL,
    `periodStart` DATETIME(3) NOT NULL,
    `periodEnd` DATETIME(3) NOT NULL,
    `totalRevenue` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `totalFee` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `totalPayable` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `status` ENUM('PENDING', 'PAID', 'CANCELLED', 'DISPUTED') NOT NULL DEFAULT 'PENDING',
    `paymentMethod` ENUM('CASH', 'TRANSFER', 'CREDIT') NULL,
    `paymentDate` DATETIME(3) NULL,
    `paymentRef` VARCHAR(191) NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `settlements_code_key`(`code`),
    INDEX `settlements_consignorId_periodStart_idx`(`consignorId`, `periodStart`),
    INDEX `settlements_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_movements` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `movementType` ENUM('PURCHASE_IN', 'CONSIGNMENT_IN', 'CONSIGNMENT_RETURN', 'SALE_OUT', 'RETURN_IN', 'RETURN_OUT', 'EXPIRED_OUT', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT') NOT NULL,
    `occurredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `referenceId` VARCHAR(191) NULL,
    `referenceType` ENUM('PURCHASE', 'CONSIGNMENT_BATCH', 'SALE', 'ADJUSTMENT', 'EXPIRY') NULL,
    `unitCost` DECIMAL(65, 30) NULL,
    `isProduction` BOOLEAN NOT NULL DEFAULT true,

    INDEX `stock_movements_productId_occurredAt_idx`(`productId`, `occurredAt`),
    INDEX `stock_movements_referenceType_referenceId_idx`(`referenceType`, `referenceId`),
    INDEX `stock_movements_isProduction_idx`(`isProduction`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier_payments` (
    `id` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `paymentMethod` ENUM('CASH', 'TRANSFER', 'CREDIT') NOT NULL DEFAULT 'TRANSFER',
    `paymentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `periodStart` DATETIME(3) NOT NULL,
    `periodEnd` DATETIME(3) NOT NULL,
    `referenceNo` VARCHAR(191) NULL,
    `verifiedBy` VARCHAR(191) NULL,
    `verifiedAt` DATETIME(3) NULL,
    `status` ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `paymentProof` VARCHAR(191) NULL,
    `supplierId` VARCHAR(191) NOT NULL,

    INDEX `supplier_payments_supplierId_paymentDate_idx`(`supplierId`, `paymentDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_submissions` (
    `id` VARCHAR(191) NOT NULL,
    `supplierId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `price` DECIMAL(65, 30) NOT NULL,
    `stockInitial` INTEGER NOT NULL,
    `unit` VARCHAR(191) NOT NULL DEFAULT 'pcs',
    `image` VARCHAR(191) NULL,
    `status` ENUM('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'RESUBMITTED') NOT NULL DEFAULT 'PENDING_REVIEW',
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reviewedAt` DATETIME(3) NULL,
    `reviewedBy` VARCHAR(191) NULL,
    `rejectionReason` VARCHAR(191) NULL,
    `approvedProductId` VARCHAR(191) NULL,

    UNIQUE INDEX `product_submissions_approvedProductId_key`(`approvedProductId`),
    INDEX `product_submissions_supplierId_status_idx`(`supplierId`, `status`),
    INDEX `product_submissions_status_submittedAt_idx`(`status`, `submittedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `suppliers` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `paymentTerms` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `approvedAt` DATETIME(3) NULL,
    `approvedById` VARCHAR(191) NULL,
    `businessName` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isPaymentActive` BOOLEAN NOT NULL DEFAULT false,
    `lastPaymentDate` DATETIME(3) NULL,
    `monthlyFee` DECIMAL(65, 30) NOT NULL DEFAULT 25000,
    `nextPaymentDue` DATETIME(3) NULL,
    `ownerName` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `paymentStatus` ENUM('UNPAID', 'PARTIAL', 'PAID', 'PAID_PENDING_APPROVAL', 'PAID_APPROVED', 'PAID_REJECTED') NOT NULL DEFAULT 'UNPAID',
    `productCategory` VARCHAR(191) NULL,
    `rejectedReason` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'ACTIVE') NOT NULL DEFAULT 'PENDING',
    `paymentGraceDays` INTEGER NOT NULL DEFAULT 7,
    `isSuspendedForPayment` BOOLEAN NOT NULL DEFAULT false,
    `suspendedAt` DATETIME(3) NULL,
    `suspensionReason` VARCHAR(191) NULL,
    `maxActiveProducts` INTEGER NOT NULL DEFAULT 10,
    `currentActiveProducts` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `suppliers_code_key`(`code`),
    UNIQUE INDEX `suppliers_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaction_items` (
    `id` VARCHAR(191) NOT NULL,
    `transactionId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unitPrice` DECIMAL(65, 30) NOT NULL,
    `totalPrice` DECIMAL(65, 30) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `cogsPerUnit` DECIMAL(65, 30) NULL,
    `grossProfit` DECIMAL(65, 30) NULL,
    `totalCogs` DECIMAL(65, 30) NULL,
    `isProduction` BOOLEAN NOT NULL DEFAULT true,

    INDEX `transaction_items_productId_idx`(`productId`),
    INDEX `transaction_items_transactionId_idx`(`transactionId`),
    INDEX `transaction_items_isProduction_idx`(`isProduction`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `id` VARCHAR(191) NOT NULL,
    `memberId` VARCHAR(191) NULL,
    `type` ENUM('SALE', 'PURCHASE', 'RETURN', 'INCOME', 'EXPENSE') NOT NULL,
    `totalAmount` DECIMAL(65, 30) NOT NULL,
    `paymentMethod` ENUM('CASH', 'TRANSFER', 'CREDIT') NOT NULL DEFAULT 'CASH',
    `status` ENUM('PENDING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'COMPLETED',
    `note` VARCHAR(191) NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isProduction` BOOLEAN NOT NULL DEFAULT true,

    INDEX `transactions_isProduction_idx`(`isProduction`),
    INDEX `transactions_memberId_createdAt_idx`(`memberId`, `createdAt`),
    INDEX `transactions_status_idx`(`status`),
    INDEX `transactions_date_idx`(`date`),
    INDEX `transactions_paymentMethod_idx`(`paymentMethod`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` ENUM('SUPER_ADMIN', 'ADMIN', 'SUPPLIER', 'USER', 'DEVELOPER') NOT NULL DEFAULT 'USER',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `lastLoginAt` DATETIME(3) NULL,
    `mustChangePassword` BOOLEAN NOT NULL DEFAULT true,
    `passwordChangedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `lastActiveAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `sessions_token_key`(`token`),
    INDEX `sessions_userId_idx`(`userId`),
    INDEX `sessions_token_idx`(`token`),
    INDEX `sessions_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member_points_history` (
    `id` VARCHAR(191) NOT NULL,
    `memberId` VARCHAR(191) NOT NULL,
    `transactionId` VARCHAR(191) NULL,
    `type` ENUM('EARNED', 'REDEEMED', 'EXPIRED', 'ADJUSTED') NOT NULL,
    `points` INTEGER NOT NULL,
    `balance` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `member_points_history_memberId_idx`(`memberId`),
    INDEX `member_points_history_createdAt_idx`(`createdAt`),
    INDEX `member_points_history_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `activity_logs` ADD CONSTRAINT `activity_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `broadcasts` ADD CONSTRAINT `broadcasts_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consignment_batches` ADD CONSTRAINT `consignment_batches_consignorId_fkey` FOREIGN KEY (`consignorId`) REFERENCES `consignors`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consignment_batches` ADD CONSTRAINT `consignment_batches_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consignment_sales` ADD CONSTRAINT `consignment_sales_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `consignment_batches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consignment_sales` ADD CONSTRAINT `consignment_sales_settlementId_fkey` FOREIGN KEY (`settlementId`) REFERENCES `settlements`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consignment_sales` ADD CONSTRAINT `consignment_sales_transactionItemId_fkey` FOREIGN KEY (`transactionItemId`) REFERENCES `transaction_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consignment_payments` ADD CONSTRAINT `consignment_payments_paidBy_fkey` FOREIGN KEY (`paidBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consignment_payments` ADD CONSTRAINT `consignment_payments_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `suppliers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consignment_payments` ADD CONSTRAINT `consignment_payments_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loan_payments` ADD CONSTRAINT `loan_payments_loanId_fkey` FOREIGN KEY (`loanId`) REFERENCES `loans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loans` ADD CONSTRAINT `loans_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `members` ADD CONSTRAINT `members_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `suppliers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_items` ADD CONSTRAINT `purchase_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_items` ADD CONSTRAINT `purchase_items_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `purchases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchases` ADD CONSTRAINT `purchases_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `suppliers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `savings` ADD CONSTRAINT `savings_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `settlements` ADD CONSTRAINT `settlements_consignorId_fkey` FOREIGN KEY (`consignorId`) REFERENCES `consignors`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_movements` ADD CONSTRAINT `stock_movements_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supplier_payments` ADD CONSTRAINT `supplier_payments_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `suppliers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_submissions` ADD CONSTRAINT `product_submissions_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `suppliers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_submissions` ADD CONSTRAINT `product_submissions_reviewedBy_fkey` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_submissions` ADD CONSTRAINT `product_submissions_approvedProductId_fkey` FOREIGN KEY (`approvedProductId`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_submissions` ADD CONSTRAINT `product_submissions_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_items` ADD CONSTRAINT `transaction_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_items` ADD CONSTRAINT `transaction_items_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_points_history` ADD CONSTRAINT `member_points_history_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
