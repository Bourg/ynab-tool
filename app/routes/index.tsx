import { createFileRoute, useRouter } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useSession } from '@tanstack/react-start/server';

export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => {
    const session = await useSession({
      password: 'TODO CHANGE THIS OR FACE MY OWN WRATH',
    });

    return {
      session,
    };
  },
});

function Home() {
  const state = Route.useLoaderData();

  return <pre>{JSON.stringify(state, null, 2)}</pre>;
}
