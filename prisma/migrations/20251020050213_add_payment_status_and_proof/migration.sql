-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentStatus" ADD VALUE 'PAID_PENDING_APPROVAL';
ALTER TYPE "PaymentStatus" ADD VALUE 'PAID_APPROVED';
ALTER TYPE "PaymentStatus" ADD VALUE 'PAID_REJECTED';

-- AlterTable
ALTER TABLE "supplier_payments" ADD COLUMN     "paymentProof" TEXT;
