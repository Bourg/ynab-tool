import { createFileRoute, useRouter } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useSession } from '../server/session';

import config from '../server/config';

export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => {
    const session = await useSession();

    return {
      session,
      other: 'hi!',
      and: 'changed',
    };
  },
});

function Home() {
  const state = Route.useLoaderData();

  return <pre>{JSON.stringify(state, null, 2)}</pre>;
}
