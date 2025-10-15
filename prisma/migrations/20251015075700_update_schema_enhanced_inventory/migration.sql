/*
  Warnings:

  - You are about to drop the column `date` on the `stock_movements` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `stock_movements` table. All the data in the column will be lost.
  - Added the required column `movementType` to the `stock_movements` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OwnershipType" AS ENUM ('TOKO', 'TITIPAN');

-- CreateEnum
CREATE TYPE "StockCycle" AS ENUM ('HARIAN', 'MINGGUAN', 'DUA_MINGGUAN');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SEASONAL');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('PURCHASE_IN', 'CONSIGNMENT_IN', 'SALE_OUT', 'RETURN_IN', 'RETURN_OUT', 'EXPIRED_OUT', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT');

-- CreateEnum
CREATE TYPE "ReferenceType" AS ENUM ('PURCHASE', 'CONSIGNMENT_BATCH', 'SALE', 'ADJUSTMENT', 'EXPIRY');

-- CreateEnum
CREATE TYPE "FeeType" AS ENUM ('PERCENTAGE', 'FLAT', 'HYBRID');

-- CreateEnum
CREATE TYPE "SupplierStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'ACTIVE');

-- CreateEnum
CREATE TYPE "PaymentVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PARTIAL', 'PAID');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('ACTIVE', 'DEPLETED', 'RETURNED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SettlementStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'DISPUTED');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "avgCost" DECIMAL(65,30),
ADD COLUMN     "expiryPolicy" TEXT,
ADD COLUMN     "isConsignment" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastRestockAt" TIMESTAMP(3),
ADD COLUMN     "ownershipType" "OwnershipType" NOT NULL DEFAULT 'TOKO',
ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "stockCycle" "StockCycle" NOT NULL DEFAULT 'MINGGUAN',
ALTER COLUMN "buyPrice" DROP NOT NULL;

-- AlterTable
ALTER TABLE "stock_movements" DROP COLUMN "date",
DROP COLUMN "type",
ADD COLUMN     "movementType" "MovementType" NOT NULL,
ADD COLUMN     "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "referenceId" TEXT,
ADD COLUMN     "referenceType" "ReferenceType",
ADD COLUMN     "unitCost" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "transaction_items" ADD COLUMN     "cogsPerUnit" DECIMAL(65,30),
ADD COLUMN     "grossProfit" DECIMAL(65,30),
ADD COLUMN     "totalCogs" DECIMAL(65,30);

-- DropEnum
DROP TYPE "public"."StockMovementType";

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "paymentTerms" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consignors" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "feeType" "FeeType" NOT NULL DEFAULT 'PERCENTAGE',
    "defaultFeePercent" DECIMAL(65,30),
    "defaultFeeFlat" DECIMAL(65,30),
    "paymentSchedule" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consignors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "productCategory" TEXT NOT NULL,
    "description" TEXT,
    "status" "SupplierStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedReason" TEXT,
    "monthlyFee" DECIMAL(65,30) NOT NULL DEFAULT 25000,
    "lastPaymentDate" TIMESTAMP(3),
    "nextPaymentDue" TIMESTAMP(3),
    "isPaymentActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_payments" (
    "id" TEXT NOT NULL,
    "supplierProfileId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'TRANSFER',
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "referenceNo" TEXT,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "status" "PaymentVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchases" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "totalAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receivedDate" TIMESTAMP(3),
    "status" "PurchaseStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "paymentDate" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_items" (
    "id" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitCost" DECIMAL(65,30) NOT NULL,
    "totalCost" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consignment_batches" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "consignorId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "qtyIn" INTEGER NOT NULL,
    "qtySold" INTEGER NOT NULL DEFAULT 0,
    "qtyReturned" INTEGER NOT NULL DEFAULT 0,
    "qtyExpired" INTEGER NOT NULL DEFAULT 0,
    "qtyRemaining" INTEGER NOT NULL,
    "feeType" "FeeType" NOT NULL,
    "feePercent" DECIMAL(65,30),
    "feeFlat" DECIMAL(65,30),
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryAt" TIMESTAMP(3),
    "status" "BatchStatus" NOT NULL DEFAULT 'ACTIVE',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consignment_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consignment_sales" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "transactionItemId" TEXT NOT NULL,
    "qtySold" INTEGER NOT NULL,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "totalRevenue" DECIMAL(65,30) NOT NULL,
    "feeType" "FeeType" NOT NULL,
    "feeAmount" DECIMAL(65,30) NOT NULL,
    "netToConsignor" DECIMAL(65,30) NOT NULL,
    "settlementId" TEXT,
    "isSettled" BOOLEAN NOT NULL DEFAULT false,
    "saleDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consignment_sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settlements" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "consignorId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "totalRevenue" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalFee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalPayable" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "status" "SettlementStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" "PaymentMethod",
    "paymentDate" TIMESTAMP(3),
    "paymentRef" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settlements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_code_key" ON "suppliers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "consignors_code_key" ON "consignors"("code");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_profiles_userId_key" ON "supplier_profiles"("userId");

-- CreateIndex
CREATE INDEX "supplier_payments_supplierProfileId_paymentDate_idx" ON "supplier_payments"("supplierProfileId", "paymentDate");

-- CreateIndex
CREATE UNIQUE INDEX "purchases_code_key" ON "purchases"("code");

-- CreateIndex
CREATE INDEX "purchases_supplierId_purchaseDate_idx" ON "purchases"("supplierId", "purchaseDate");

-- CreateIndex
CREATE INDEX "purchase_items_purchaseId_idx" ON "purchase_items"("purchaseId");

-- CreateIndex
CREATE INDEX "purchase_items_productId_idx" ON "purchase_items"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "consignment_batches_code_key" ON "consignment_batches"("code");

-- CreateIndex
CREATE INDEX "consignment_batches_consignorId_receivedAt_idx" ON "consignment_batches"("consignorId", "receivedAt");

-- CreateIndex
CREATE INDEX "consignment_batches_productId_status_idx" ON "consignment_batches"("productId", "status");

-- CreateIndex
CREATE INDEX "consignment_batches_receivedAt_idx" ON "consignment_batches"("receivedAt");

-- CreateIndex
CREATE INDEX "consignment_sales_batchId_idx" ON "consignment_sales"("batchId");

-- CreateIndex
CREATE INDEX "consignment_sales_settlementId_idx" ON "consignment_sales"("settlementId");

-- CreateIndex
CREATE INDEX "consignment_sales_saleDate_idx" ON "consignment_sales"("saleDate");

-- CreateIndex
CREATE UNIQUE INDEX "settlements_code_key" ON "settlements"("code");

-- CreateIndex
CREATE INDEX "settlements_consignorId_periodStart_idx" ON "settlements"("consignorId", "periodStart");

-- CreateIndex
CREATE INDEX "settlements_status_idx" ON "settlements"("status");

-- CreateIndex
CREATE INDEX "stock_movements_productId_occurredAt_idx" ON "stock_movements"("productId", "occurredAt");

-- CreateIndex
CREATE INDEX "stock_movements_referenceType_referenceId_idx" ON "stock_movements"("referenceType", "referenceId");

-- CreateIndex
CREATE INDEX "transaction_items_transactionId_idx" ON "transaction_items"("transactionId");

-- CreateIndex
CREATE INDEX "transaction_items_productId_idx" ON "transaction_items"("productId");

-- AddForeignKey
ALTER TABLE "supplier_profiles" ADD CONSTRAINT "supplier_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_payments" ADD CONSTRAINT "supplier_payments_supplierProfileId_fkey" FOREIGN KEY ("supplierProfileId") REFERENCES "supplier_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consignment_batches" ADD CONSTRAINT "consignment_batches_consignorId_fkey" FOREIGN KEY ("consignorId") REFERENCES "consignors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consignment_batches" ADD CONSTRAINT "consignment_batches_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consignment_sales" ADD CONSTRAINT "consignment_sales_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "consignment_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consignment_sales" ADD CONSTRAINT "consignment_sales_transactionItemId_fkey" FOREIGN KEY ("transactionItemId") REFERENCES "transaction_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consignment_sales" ADD CONSTRAINT "consignment_sales_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "settlements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_consignorId_fkey" FOREIGN KEY ("consignorId") REFERENCES "consignors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
