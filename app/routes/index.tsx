import { createFileRoute, Link } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

import { ynabIntegrationMiddleware } from '~/middleware';
import { findOrInitializeBudgets } from '~/server/ynab/data';

export const Route = createFileRoute('/')({
  beforeLoad: async () => {},
  loader: () => loader(),
  component: Index,
});

const loader = createServerFn()
  .middleware([ynabIntegrationMiddleware])
  .handler(async ({ context: { user, ynabIntegration } }) => {
    const budgets = await findOrInitializeBudgets(user.id, ynabIntegration);

    return {
      budgets,
    };
  });

export function Index() {
  const { budgets } = Route.useLoaderData();

  return (
    <main>
      <ul>
        {budgets.map((budget) => (
          <li key={budget.id}>
            <Link to="/budget/$budgetId" params={{ budgetId: budget.id }}>
              {budget.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
