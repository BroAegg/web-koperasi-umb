-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'DEVELOPER';

-- AlterTable
ALTER TABLE "consignment_sales" ADD COLUMN     "isProduction" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "stock_movements" ADD COLUMN     "isProduction" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "transaction_items" ADD COLUMN     "isProduction" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "isProduction" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userRole" "Role" NOT NULL,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "isProduction" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_logs_userId_idx" ON "activity_logs"("userId");

-- CreateIndex
CREATE INDEX "activity_logs_userRole_idx" ON "activity_logs"("userRole");

-- CreateIndex
CREATE INDEX "activity_logs_module_idx" ON "activity_logs"("module");

-- CreateIndex
CREATE INDEX "activity_logs_action_idx" ON "activity_logs"("action");

-- CreateIndex
CREATE INDEX "activity_logs_isProduction_idx" ON "activity_logs"("isProduction");

-- CreateIndex
CREATE INDEX "activity_logs_createdAt_idx" ON "activity_logs"("createdAt");

-- CreateIndex
CREATE INDEX "consignment_sales_isProduction_idx" ON "consignment_sales"("isProduction");

-- CreateIndex
CREATE INDEX "stock_movements_isProduction_idx" ON "stock_movements"("isProduction");

-- CreateIndex
CREATE INDEX "transaction_items_isProduction_idx" ON "transaction_items"("isProduction");

-- CreateIndex
CREATE INDEX "transactions_isProduction_idx" ON "transactions"("isProduction");

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
