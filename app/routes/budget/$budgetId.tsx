import { Account, Budget, Category } from '@prisma/client';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useCallback } from 'react';
import { z } from 'zod';

import { useCurrency } from '~/hooks/useCurrency';
import { authMiddleware, ynabIntegrationMiddleware } from '~/middleware';
import { prisma } from '~/server/db';
import { findOrInitializeBudget, updateBudget } from '~/server/ynab/data';

const loader = createServerFn()
  .middleware([ynabIntegrationMiddleware])
  .validator(z.object({ budgetId: z.string() }))
  .handler(
    async ({ context: { user, ynabIntegration }, data: { budgetId } }) => {
      const budget = await findOrInitializeBudget(
        user.id,
        budgetId,
        ynabIntegration,
      );

      const nextCategoryToAssign = await prisma.category.findFirst({
        where: {
          assignedToAccount: null,
          anyAccount: false,
        },
      });

      return { budget, nextCategoryToAssign };
    },
  );

const assignCategoryToAccount = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(
    z.object({ accountId: z.string().nullable(), categoryId: z.string() }),
  )
  .handler(async ({ context: { user }, data: { accountId, categoryId } }) => {
    await prisma.category.update({
      data: {
        assignedToAccountId: accountId,
        anyAccount: accountId == null,
      },
      where: {
        id: categoryId,
        budget: {
          userAssociations: {
            some: {
              userId: user.id,
            },
          },
        },
      },
    });
  });

const reloadBudget = createServerFn({ method: 'POST' })
  .middleware([ynabIntegrationMiddleware])
  .validator(
    z.object({ budgetId: z.string(), serverKnowledge: z.number().nullable() }),
  )
  .handler(
    async ({
      context: { user, ynabIntegration },
      data: { budgetId, serverKnowledge },
    }) => {
      await updateBudget(user.id, budgetId, ynabIntegration, serverKnowledge);
    },
  );

export const Route = createFileRoute('/budget/$budgetId')({
  component: RouteComponent,
  loader: ({ params }) => loader({ data: params }),
});

function RouteComponent() {
  const { invalidate } = useRouter();
  const { budget, nextCategoryToAssign } = Route.useLoaderData();

  const assignNext = useCallback(
    (accountId: string | null) =>
      assignCategoryToAccount({
        data: {
          categoryId: nextCategoryToAssign?.id ?? '', // TODO refactor this into two components
          accountId,
        },
      }).then(() => invalidate()),
    [invalidate, nextCategoryToAssign],
  );

  return (
    <main>
      <h1>{budget.name}</h1>
      {nextCategoryToAssign == null ? (
        <BalancingResults
          budget={budget}
          accounts={budget.accounts}
          categories={budget.categories}
        />
      ) : (
        <>
          <p>
            <em>Next category to assign:</em> {nextCategoryToAssign.name}
          </p>
          {budget.accounts
            .filter((a) => isAssignableAccountType(a.type))
            .map((account) => (
              <button onClick={() => assignNext(account.id)}>
                {account.name}
              </button>
            ))}
          <button onClick={() => assignNext(null)}>Any account</button>
        </>
      )}
      <button
        onClick={() =>
          reloadBudget({
            data: {
              budgetId: budget.id,
              serverKnowledge: budget.serverKnowledge,
            },
          }).then(() => invalidate())
        }
      >
        Reload Budget
      </button>
    </main>
  );
}

function BalancingResults({
  budget,
  accounts,
  categories,
}: {
  budget: Budget;
  accounts: Account[];
  categories: Category[];
}) {
  const currency = useCurrency(budget.isoCurrencyCode);

  const levelingAccounts = accounts.filter((a) =>
    isAssignableAccountType(a.type),
  );

  const minimumWorkingBalancesByAccount = Object.fromEntries(
    levelingAccounts.map((d) => [d.id, 0] as [string, number]),
  );

  categories.forEach((c) => {
    if (c.assignedToAccountId != null) {
      minimumWorkingBalancesByAccount[c.assignedToAccountId] += c.balance;
    }
  });

  return (
    <table>
      <thead>
        <tr>
          <td>Account</td>
          <td>Actual Balance</td>
          <td>Minimum Working Balance</td>
          <td>Deficit from Minimum Working Balance</td>
        </tr>
      </thead>
      <tbody>
        {levelingAccounts.map((d) => {
          const minBal = minimumWorkingBalancesByAccount[d.id];
          const deficitFromMinBal = minBal - d.balance;

          return (
            <tr key={d.id}>
              <td>{d.name}</td>
              <td>{currency(d.balance)}</td>
              <td>{currency(minBal)}</td>
              <td>
                {deficitFromMinBal > 0
                  ? `Deficit of ${currency(deficitFromMinBal)}`
                  : `Surplus of ${currency(-deficitFromMinBal)}`}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function isAssignableAccountType(accountType: string) {
  return accountType === 'savings' || accountType === 'checking';
}
