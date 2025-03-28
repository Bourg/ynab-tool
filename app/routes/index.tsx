import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

import { authMiddleware } from '../middleware';

export const Route = createFileRoute('/')({
  beforeLoad: async () => {},
  loader: () => loader(),
  component: Index,
});

const loader = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return { user: context.user };
  });

export function Index() {
  const { user } = Route.useLoaderData();

  return <p>You are logged in as {user.username}</p>;
}
