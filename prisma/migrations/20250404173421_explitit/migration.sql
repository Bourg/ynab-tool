/*
  Warnings:

  - You are about to drop the `_BudgetToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_BudgetToUser" DROP CONSTRAINT "_BudgetToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_BudgetToUser" DROP CONSTRAINT "_BudgetToUser_B_fkey";

-- DropTable
DROP TABLE "_BudgetToUser";

-- CreateTable
CREATE TABLE "UserBudgetAssociation" (
    "userId" INTEGER NOT NULL,
    "budgetId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserBudgetAssociation_userId_budgetId_key" ON "UserBudgetAssociation"("userId", "budgetId");

-- AddForeignKey
ALTER TABLE "UserBudgetAssociation" ADD CONSTRAINT "UserBudgetAssociation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBudgetAssociation" ADD CONSTRAINT "UserBudgetAssociation_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
