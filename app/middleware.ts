import { createMiddleware } from '@tanstack/react-start';
import { getLoggedInUserId, useSession } from './server/session.server';
import { redirect } from '@tanstack/react-router';
import { prisma } from './server/db.server';

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const session = await useSession();
  const userId = getLoggedInUserId(session);
  if (userId == null) {
    throw redirect({ to: '/login' });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { ynabIntegration: true },
  });
  if (user == null) {
    throw redirect({ to: '/login' });
  }

  return await next({ context: { user } });
});
