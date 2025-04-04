import { Budget, User, YnabIntegration } from '@prisma/client';
import { API } from 'ynab';

import { prisma } from '~/server/db';

export async function findOrInitializeBudgets(
  userId: User['id'],
  integration: YnabIntegration,
): Promise<Array<Budget>> {
  const budgets = await findBudgets(userId);
  if (budgets.length > 0) {
    return budgets;
  }

  await updateBudgets(userId, integration);
  return findBudgets(userId);
}

export async function findOrInitializeBudget(
  userId: User['id'],
  budgetId: Budget['id'],
  integration: YnabIntegration,
) {
  return findOrInitializeBudgetInternal(userId, budgetId, integration, true);
}

async function findOrInitializeBudgetInternal(
  userId: User['id'],
  budgetId: Budget['id'],
  integration: YnabIntegration,
  attemptLoad: boolean,
) {
  const budget = await prisma.budget.findUnique({
    where: {
      id: budgetId,
      userAssociations: {
        some: { userId },
      },
    },
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

  await updateBudget(userId, budgetId, integration);

  return findOrInitializeBudgetInternal(userId, budgetId, integration, false);
}

export async function updateBudget(
  userId: User['id'],
  budgetId: Budget['id'],
  integration: YnabIntegration,
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
    const budgetPayload = {
      name: budget.name,
      isoCurrencyCode: budget.currency_format!.iso_code,
      serverKnowledge: budgetResponse.data.server_knowledge,
      userAssociations: {
        connect: {
          userId_budgetId: { userId, budgetId },
        },
      },
    } as const;

    const upsertBudget = tx.budget.upsert({
      create: {
        ...budgetPayload,
        id: budgetId,
      },
      update: budgetPayload,
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

function findBudgets(userId: User['id']) {
  return prisma.budget.findMany({
    where: {
      userAssociations: {
        some: {
          userId,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });
}

async function updateBudgets(userId: User['id'], integration: YnabIntegration) {
  const budgetsResponse = await new API(
    integration.accessToken,
  ).budgets.getBudgets();

  await prisma.$transaction((tx) =>
    Promise.all(
      budgetsResponse.data.budgets.map((budget) => {
        const payload = {
          id: budget.id,
          name: budget.name,
          isoCurrencyCode: budget.currency_format!.iso_code,
          userAssociations: {
            connectOrCreate: {
              create: { userId },
              where: { userId_budgetId: { userId, budgetId: budget.id } },
            },
          },
        } as const;

        return tx.budget.upsert({
          create: payload,
          update: payload,
          where: {
            id: budget.id,
          },
        });
      }),
    ),
  );
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
