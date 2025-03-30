import { YnabBudget, YnabIntegration } from '@prisma/client';
import { API } from 'ynab';

import { prisma } from '~/server/db';

export async function getBudgets(
  integration: YnabIntegration,
): Promise<Array<YnabBudget>> {
  const budgets = await findBudgets(integration);
  if (budgets.length > 0) {
    return budgets;
  }

  await updateBudgets(integration);
  return findBudgets(integration);
}

async function updateBudgets(integration: YnabIntegration) {
  const budgetsResponse = await new API(
    integration.accessToken,
  ).budgets.getBudgets();

  await prisma.ynabBudget.createMany({
    data: budgetsResponse.data.budgets.map((budget) => ({
      id: budget.id,
      ynabIntegrationId: integration.id,
      name: budget.name,
      isoCurrencyCode: budget.currency_format!.iso_code,
    })),
  });
}

function findBudgets(integration: YnabIntegration) {
  return prisma.ynabBudget.findMany({
    where: {
      ynabIntegrationId: integration.id,
    },
    orderBy: {
      name: 'asc',
    },
  });
}
