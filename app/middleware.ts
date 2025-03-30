import { redirect } from '@tanstack/react-router';
import { createMiddleware } from '@tanstack/react-start';

import { prisma } from './server/db';
import { getLoggedInUserId, useSession } from './server/session';
import { refreshAccessToken } from './server/ynab/auth';

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

export const ynabIntegrationMiddleware = createMiddleware()
  .middleware([authMiddleware])
  .server(async ({ next, context: { user } }) => {
    let { ynabIntegration } = user;
    if (ynabIntegration == null) {
      throw redirect({ to: '/ynab/connect' });
    }

    // TODO this is kind of jank - make a better refresh detector
    // TODO where should I even do this...?
    if (ynabIntegration.expiresAt < new Date()) {
      const refreshedToken = await refreshAccessToken(
        ynabIntegration.refreshToken,
      );

      ynabIntegration = await prisma.ynabIntegration.update({
        where: { userId: user.id },
        data: refreshedToken,
      });
      user.ynabIntegration = ynabIntegration;
    }

    return await next({ context: { user, ynabIntegration } });
  });
