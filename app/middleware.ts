import { createMiddleware } from '@tanstack/react-start';
import { redirect } from '@tanstack/react-router';
import { getLoggedInUserId, useSession } from './server/session.server';
import { prisma } from './server/db.server';
import { refreshAccessToken } from './server/ynab.server';

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

export const ynabTokenMiddleware = createMiddleware()
  .middleware([authMiddleware])
  .server(async ({ next, context: { user } }) => {
    if (user.ynabIntegration == null) {
      throw redirect({ to: '/ynab/connect' });
    }

    // TODO this is kind of jank - make a better refresh detector
    let accessToken = user.ynabIntegration.accessToken;
    if (user.ynabIntegration.expiresAt < new Date()) {
      const refreshedToken = await refreshAccessToken(
        user.ynabIntegration.refreshToken,
      );

      const ynabIntegration = await prisma.ynabIntegration.update({
        where: { userId: user.id },
        data: refreshedToken,
      });
      user.ynabIntegration = ynabIntegration;
      accessToken = ynabIntegration.accessToken;
    }

    return await next({ context: { user, ynabAccessToken: accessToken } });
  });
