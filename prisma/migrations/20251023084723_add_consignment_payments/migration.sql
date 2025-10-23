/*
  Warnings:

  - You are about to drop the column `supplierProfileId` on the `supplier_payments` table. All the data in the column will be lost.
  - You are about to drop the column `contact` on the `suppliers` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `suppliers` table. All the data in the column will be lost.
  - You are about to drop the `supplier_profiles` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `suppliers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `supplierId` to the `supplier_payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessName` to the `suppliers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerName` to the `suppliers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `suppliers` table without a default value. This is not possible if the table is not empty.
  - Made the column `phone` on table `suppliers` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `suppliers` required. This step will fail if there are existing NULL values in that column.
  - Made the column `address` on table `suppliers` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."supplier_payments" DROP CONSTRAINT "supplier_payments_supplierProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."supplier_profiles" DROP CONSTRAINT "supplier_profiles_userId_fkey";

-- DropIndex
DROP INDEX "public"."supplier_payments_supplierProfileId_paymentDate_idx";

-- AlterTable
ALTER TABLE "supplier_payments" DROP COLUMN "supplierProfileId",
ADD COLUMN     "supplierId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "suppliers" DROP COLUMN "contact",
DROP COLUMN "name",
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "businessName" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isPaymentActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastPaymentDate" TIMESTAMP(3),
ADD COLUMN     "monthlyFee" DECIMAL(65,30) NOT NULL DEFAULT 25000,
ADD COLUMN     "nextPaymentDue" TIMESTAMP(3),
ADD COLUMN     "ownerName" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
ADD COLUMN     "productCategory" TEXT,
ADD COLUMN     "rejectedReason" TEXT,
ADD COLUMN     "status" "SupplierStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "address" SET NOT NULL;

-- DropTable
DROP TABLE "public"."supplier_profiles";

-- CreateTable
CREATE TABLE "consignment_payments" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT,
    "supplierName" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "period" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PAID',
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH',
    "transactionId" TEXT,
    "paidBy" TEXT NOT NULL,
    "note" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consignment_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "consignment_payments_transactionId_key" ON "consignment_payments"("transactionId");

-- CreateIndex
CREATE INDEX "consignment_payments_supplierId_idx" ON "consignment_payments"("supplierId");

-- CreateIndex
CREATE INDEX "consignment_payments_createdAt_idx" ON "consignment_payments"("createdAt");

-- CreateIndex
CREATE INDEX "consignment_payments_periodStart_periodEnd_idx" ON "consignment_payments"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "supplier_payments_supplierId_paymentDate_idx" ON "supplier_payments"("supplierId", "paymentDate");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_email_key" ON "suppliers"("email");

-- AddForeignKey
ALTER TABLE "consignment_payments" ADD CONSTRAINT "consignment_payments_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consignment_payments" ADD CONSTRAINT "consignment_payments_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consignment_payments" ADD CONSTRAINT "consignment_payments_paidBy_fkey" FOREIGN KEY ("paidBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_payments" ADD CONSTRAINT "supplier_payments_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
