import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

import { authMiddleware } from '../middleware';
import config from '../server/config.server';
import { getAuthorizeUri } from '../util/ynab';

export const Route = createFileRoute('/')({
  beforeLoad: async () => {},
  loader: () => loader(),
  component: Index,
});

const loader = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return {
      user: context.user,
      authorizeUri: config.ynab.oauth.authorizeUri,
      clientId: config.ynab.oauth.clientId,
    };
  });

export function Index() {
  const { user, authorizeUri, clientId } = Route.useLoaderData();

  return (
    <main>
      <p>You are logged in as {user.username}</p>
      {user.ynabIntegration == null ? (
        <button onClick={() => initiateYnabLogin({ authorizeUri, clientId })}>
          Connect your YNAB account
        </button>
      ) : (
        <p>You are connected to YNAB!</p>
      )}
    </main>
  );
}

function initiateYnabLogin(
  config: Omit<Parameters<typeof getAuthorizeUri>[0], 'origin'>,
) {
  window.location.href = getAuthorizeUri({
    ...config,
    origin: window.location.origin,
  });
}
