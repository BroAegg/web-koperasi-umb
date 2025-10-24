-- CreateEnum for ConsignmentPaymentStatus
CREATE TYPE "ConsignmentPaymentStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'REJECTED');

-- Add new columns for payment request workflow
ALTER TABLE "consignment_payments" 
  ADD COLUMN "proofImageUrl" TEXT,
  ADD COLUMN "requestedBy" TEXT,
  ADD COLUMN "requestedAt" TIMESTAMP(3),
  ADD COLUMN "reviewedBy" TEXT,
  ADD COLUMN "reviewedAt" TIMESTAMP(3),
  ADD COLUMN "rejectedReason" TEXT,
  ADD COLUMN "bankName" TEXT,
  ADD COLUMN "accountNumber" TEXT;

-- Add new index on status for faster queries
CREATE INDEX "consignment_payments_status_idx" ON "consignment_payments"("status");

-- Migrate existing string status to enum (all existing records are "PAID")
-- First add temp column with enum type
ALTER TABLE "consignment_payments" ADD COLUMN "status_new" "ConsignmentPaymentStatus" DEFAULT 'PAID';

-- Copy data: existing 'PAID' strings become PAID enum
UPDATE "consignment_payments" SET "status_new" = 'PAID'::"ConsignmentPaymentStatus" WHERE "status" = 'PAID';

-- Drop old column and rename new one
ALTER TABLE "consignment_payments" DROP COLUMN "status";
ALTER TABLE "consignment_payments" RENAME COLUMN "status_new" TO "status";

-- Set default for new records
ALTER TABLE "consignment_payments" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"ConsignmentPaymentStatus";
