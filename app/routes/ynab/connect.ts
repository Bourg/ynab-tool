import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

import { authMiddleware } from '~/middleware';
import config from '~/server/config.server';
import { getAuthorizeUri } from '~/util/ynab';
import { useEffect } from 'react';

const loader = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .handler(() => {
    return {
      authorizeUri: config.ynab.oauth.authorizeUri,
      clientId: config.ynab.oauth.clientId,
    };
  });

export const Route = createFileRoute('/ynab/connect')({
  loader: () => loader(),
  component: Connect,
});

function Connect() {
  const loaderData = Route.useLoaderData();

  useEffect(() => {
    initiateYnabLogin(loaderData);
  }, []);
}

function initiateYnabLogin(
  config: Omit<Parameters<typeof getAuthorizeUri>[0], 'origin'>,
) {
  window.location.href = getAuthorizeUri({
    ...config,
    origin: window.location.origin,
  });
}
