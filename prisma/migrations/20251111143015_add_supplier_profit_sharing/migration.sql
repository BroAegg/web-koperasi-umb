-- DropForeignKey
ALTER TABLE `consignment_sales` DROP FOREIGN KEY `consignment_sales_batchId_fkey`;

-- AlterTable
ALTER TABLE `categories` MODIFY `icon` VARCHAR(191) NULL DEFAULT '📦';

-- AlterTable
ALTER TABLE `consignment_sales` ADD COLUMN `supplierId` VARCHAR(191) NULL,
    MODIFY `batchId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `consignment_sales_supplierId_idx` ON `consignment_sales`(`supplierId`);

-- AddForeignKey
ALTER TABLE `consignment_sales` ADD CONSTRAINT `consignment_sales_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `consignment_batches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consignment_sales` ADD CONSTRAINT `consignment_sales_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `suppliers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
