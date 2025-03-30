-- CreateTable
CREATE TABLE "YnabBudget" (
    "id" TEXT NOT NULL,
    "ynabIntegrationId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "isoCurrencyCode" TEXT NOT NULL,

    CONSTRAINT "YnabBudget_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "YnabBudget" ADD CONSTRAINT "YnabBudget_ynabIntegrationId_fkey" FOREIGN KEY ("ynabIntegrationId") REFERENCES "YnabIntegration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
