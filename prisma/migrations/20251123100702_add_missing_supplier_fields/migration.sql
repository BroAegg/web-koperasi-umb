/*
  Warnings:

  - A unique constraint covering the columns `[invoiceNumber]` on the table `transactions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `invoiceNumber` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `activity_logs` MODIFY `userRole` ENUM('SUPER_ADMIN', 'ADMIN', 'KASIR', 'SUPPLIER', 'USER', 'DEVELOPER') NOT NULL;

-- AlterTable
ALTER TABLE `categories` MODIFY `icon` VARCHAR(191) NULL DEFAULT '📦';

-- AlterTable
ALTER TABLE `loans` ADD COLUMN `approvedAt` DATETIME(3) NULL,
    ADD COLUMN `approvedBy` VARCHAR(191) NULL,
    ADD COLUMN `purpose` VARCHAR(191) NULL,
    MODIFY `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'COMPLETED', 'OVERDUE') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `members` ADD COLUMN `isMemberKoperasi` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `suppliers` ADD COLUMN `preferredPaymentMethod` ENUM('CASH', 'TRANSFER', 'CREDIT') NOT NULL DEFAULT 'TRANSFER';

-- AlterTable
ALTER TABLE `transactions` ADD COLUMN `invoiceNumber` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('SUPER_ADMIN', 'ADMIN', 'KASIR', 'SUPPLIER', 'USER', 'DEVELOPER') NOT NULL DEFAULT 'USER';

-- CreateIndex
CREATE UNIQUE INDEX `transactions_invoiceNumber_key` ON `transactions`(`invoiceNumber`);
