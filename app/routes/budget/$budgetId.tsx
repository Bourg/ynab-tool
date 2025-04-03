import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

import { ynabIntegrationMiddleware } from '~/middleware';
import { getBudget } from '~/server/ynab/data';

const loader = createServerFn()
  .validator(z.object({ budgetId: z.string() }))
  .middleware([ynabIntegrationMiddleware])
  .handler(async ({ context: { ynabIntegration }, data: { budgetId } }) =>
    getBudget(ynabIntegration, budgetId),
  );

export const Route = createFileRoute('/budget/$budgetId')({
  component: RouteComponent,
  loader: ({ params }) => loader({ data: params }),
});

function RouteComponent() {
  const budget = Route.useLoaderData();

  return <pre>{JSON.stringify(budget, null, 2)}</pre>;
}
