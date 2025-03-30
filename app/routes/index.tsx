import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

import { API } from 'ynab';
import { ynabTokenMiddleware } from '~/middleware';

export const Route = createFileRoute('/')({
  beforeLoad: async () => {},
  loader: () => loader(),
  component: Index,
});

const loader = createServerFn()
  .middleware([ynabTokenMiddleware])
  .handler(async ({ context: { user, ynabAccessToken } }) => {
    const budgets = await new API(ynabAccessToken).budgets.getBudgets();

    return {
      user,
      budgets,
    };
  });

export function Index() {
  const { user, budgets } = Route.useLoaderData();

  return (
    <main>
      <p>You are logged in as {user.username}</p>
      <pre>{JSON.stringify(budgets, null, 2)}</pre>
    </main>
  );
}
