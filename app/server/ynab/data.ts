import { Budget, YnabIntegration } from '@prisma/client';
import { API } from 'ynab';

import { prisma } from '~/server/db';

export async function getBudgets(
  integration: YnabIntegration,
): Promise<Array<Budget>> {
  const budgets = await findBudgets(integration);
  if (budgets.length > 0) {
    return budgets;
  }

  await updateBudgets(integration);
  return findBudgets(integration);
}

export async function getBudget(
  integration: YnabIntegration,
  budgetId: Budget['id'],
) {
  return getBudgetInternal(integration, budgetId, true);
}

async function getBudgetInternal(
  integration: YnabIntegration,
  budgetId: Budget['id'],
  attemptLoad: boolean,
) {
  const budget = await prisma.budget.findUnique({
    where: { id: budgetId },
    include: {
      accounts: {
        orderBy: { sequence: 'asc' },
      },
      categories: {
        orderBy: { sequence: 'asc' },
      },
    },
  });

  if (budget != null && budget.serverKnowledge != null) {
    return budget;
  }

  if (!attemptLoad) {
    throw new Error('Budget failed to load');
  }

  await updateAccountsAndCategories(integration, budgetId);

  return getBudgetInternal(integration, budgetId, false);
}

export async function updateAccountsAndCategories(
  integration: YnabIntegration,
  budgetId: Budget['id'],
  serverKnowledge?: Budget['serverKnowledge'],
) {
  const budgetResponse = await new API(
    integration.accessToken,
  ).budgets.getBudgetById(budgetId, serverKnowledge ?? undefined);

  const budget = budgetResponse.data.budget;

  const [updatedAccounts, deletedAccountIds] = splitDeletions(
    budget.accounts,
    (a) => a.deleted || a.closed,
  );
  const [updatedCategories, deletedCategoryIds] = splitDeletions(
    budget.categories,
    (c) => c.deleted,
  );

  await prisma.$transaction(async (tx) => {
    const upsertBudget = tx.budget.upsert({
      create: {
        id: budgetId,
        ynabIntegrationId: integration.id,
        name: budget.name,
        isoCurrencyCode: budget.currency_format!.iso_code,
        serverKnowledge: budgetResponse.data.server_knowledge,
      },
      update: { serverKnowledge: budgetResponse.data.server_knowledge },
      where: {
        id: budgetId,
      },
    });

    const deleteAccounts = tx.account.deleteMany({
      where: {
        id: { in: deletedAccountIds },
      },
    });
    const deleteCategories = tx.category.deleteMany({
      where: {
        id: { in: deletedCategoryIds },
      },
    });

    const updateAccounts = Promise.all(
      updatedAccounts.map((account) =>
        tx.account.upsert({
          update: {
            name: account.name,
            balance: account.balance,
            type: account.type,
          },
          create: {
            id: account.id,
            budgetId: budget.id,
            name: account.name,
            balance: account.balance,
            type: account.type,
          },
          where: {
            id: account.id,
          },
        }),
      ),
    );

    const updateCategories = Promise.all(
      updatedCategories.map((category) =>
        tx.category.upsert({
          update: {
            name: category.name,
            balance: category.balance,
            hidden: category.hidden,
          },
          create: {
            id: category.id,
            budgetId: budget.id,
            name: category.name,
            balance: category.balance,
            hidden: category.hidden,
          },
          where: {
            id: category.id,
          },
        }),
      ),
    );

    await Promise.all([
      upsertBudget,
      deleteAccounts,
      deleteCategories,
      updateAccounts,
      updateCategories,
    ]);
  });
}

async function updateBudgets(integration: YnabIntegration) {
  const budgetsResponse = await new API(
    integration.accessToken,
  ).budgets.getBudgets();

  await prisma.budget.createMany({
    data: budgetsResponse.data.budgets.map((budget) => ({
      id: budget.id,
      ynabIntegrationId: integration.id,
      name: budget.name,
      isoCurrencyCode: budget.currency_format!.iso_code,
    })),
  });
}

function findBudgets(integration: YnabIntegration) {
  return prisma.budget.findMany({
    where: {
      ynabIntegrationId: integration.id,
    },
    orderBy: {
      name: 'asc',
    },
  });
}

function splitDeletions<T extends { id: any }>(
  ts: T[] | null | undefined,
  splitter: (deletable: T) => boolean | null | undefined,
): [T[], T['id'][]] {
  const notDeleted: T[] = [];
  const deletedIds: T['id'][] = [];

  if (Array.isArray(ts)) {
    ts.forEach((t) => {
      if (splitter(t)) {
        deletedIds.push(t.id);
      } else {
        notDeleted.push(t);
      }
    });
  }

  return [notDeleted, deletedIds];
}
