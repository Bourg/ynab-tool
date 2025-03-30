import { createFileRoute, Link } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

import { ynabIntegrationMiddleware } from '~/middleware';
import { getBudgets } from '~/server/ynab/data';

export const Route = createFileRoute('/')({
  beforeLoad: async () => {},
  loader: () => loader(),
  component: Index,
});

const loader = createServerFn()
  .middleware([ynabIntegrationMiddleware])
  .handler(async ({ context: { ynabIntegration } }) => {
    const budgets = await getBudgets(ynabIntegration);

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
          <li>
            <Link to="/budget/$budgetId" params={{ budgetId: budget.id }}>
              {budget.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
