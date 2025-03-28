import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

import { ynabTokenMiddleware } from '../middleware';

export const Route = createFileRoute('/')({
  beforeLoad: async () => {},
  loader: () => loader(),
  component: Index,
});

const loader = createServerFn()
  .middleware([ynabTokenMiddleware])
  .handler(async ({ context }) => {
    return {
      user: context.user,
    };
  });

export function Index() {
  const { user } = Route.useLoaderData();

  return (
    <main>
      <p>You are logged in as {user.username}</p>
    </main>
  );
}
