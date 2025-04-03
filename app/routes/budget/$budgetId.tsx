import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

import { ynabIntegrationMiddleware } from '~/middleware';
import { getBudget } from '~/server/ynab/data';

const loader = createServerFn()
  .middleware([ynabIntegrationMiddleware])
  .validator(z.object({ budgetId: z.string() }))
  .handler(async ({ context: { ynabIntegration }, data: { budgetId } }) =>
    getBudget(ynabIntegration, budgetId),
  );

export const Route = createFileRoute('/budget/$budgetId')({
  component: RouteComponent,
  loader: ({ params }) => loader({ data: params }),
});

function RouteComponent() {
  const budget = Route.useLoaderData();

  return (
    <main>
      <h1>{budget.name}</h1>
      <h2>Accounts</h2>
      <ul>
        {budget.accounts.map((account) => (
          <li key={account.id}>{account.name}</li>
        ))}
      </ul>
      <h2>Categories</h2>
      <ul>
        {budget.categories.map((category) => (
          <li key={category.id}>
            {category.name} (hidden={String(category.hidden)})
          </li>
        ))}
      </ul>
    </main>
  );
}
