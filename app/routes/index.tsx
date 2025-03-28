import {
  createFileRoute,
  redirect,
  useLoaderData,
} from '@tanstack/react-router';

import { getLoggedInUserId, useSession } from '../server/session.server';
import { prisma } from '../server/db.server';
import { createServerFn } from '@tanstack/react-start';

export const Route = createFileRoute('/')({
  loader: () => loader(),
  component: Index,
});

const loader = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await useSession();

  const userId = getLoggedInUserId(session);
  if (userId == null) {
    throw redirect({ to: '/login' });
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  return { user };
});

export function Index() {
  const { user } = Route.useLoaderData();

  return <p>You are logged in as {user.username}</p>;
}
