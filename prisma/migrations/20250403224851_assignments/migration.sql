-- DropIndex
DROP INDEX "Account_budgetId_createdAt_idx";

-- DropIndex
DROP INDEX "Category_budgetId_createdAt_idx";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "assignedToAccountId" TEXT;

-- CreateIndex
CREATE INDEX "Account_budgetId_sequence_idx" ON "Account"("budgetId", "sequence");

-- CreateIndex
CREATE INDEX "Category_budgetId_sequence_idx" ON "Category"("budgetId", "sequence");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_assignedToAccountId_fkey" FOREIGN KEY ("assignedToAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
