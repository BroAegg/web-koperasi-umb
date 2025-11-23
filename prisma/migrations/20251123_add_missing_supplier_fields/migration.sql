-- AlterTable
ALTER TABLE `consignment_sales` ADD COLUMN `supplierId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `suppliers` ADD COLUMN `preferredPaymentMethod` ENUM('TRANSFER', 'CASH') NOT NULL DEFAULT 'TRANSFER';

-- AddIndex
ALTER TABLE `consignment_sales` ADD INDEX `consignment_sales_supplierId_idx`(`supplierId`);

-- AddForeignKey (if not already exists)
ALTER TABLE `consignment_sales` ADD CONSTRAINT `consignment_sales_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `suppliers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
