/*
  Warnings:

  - You are about to drop the column `ynabIntegrationId` on the `Budget` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Budget" DROP CONSTRAINT "Budget_ynabIntegrationId_fkey";

-- AlterTable
ALTER TABLE "Budget" DROP COLUMN "ynabIntegrationId";

-- CreateTable
CREATE TABLE "_BudgetToUser" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_BudgetToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BudgetToUser_B_index" ON "_BudgetToUser"("B");

-- AddForeignKey
ALTER TABLE "_BudgetToUser" ADD CONSTRAINT "_BudgetToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Budget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BudgetToUser" ADD CONSTRAINT "_BudgetToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
