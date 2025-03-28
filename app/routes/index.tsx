import { createFileRoute, useRouter } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useSession } from '../server/session';

import { prisma } from '../server/db';

const createUser = createServerFn({ method: 'POST' }).handler(async () => {
  return prisma.user.create({
    data: { username: 'Test', password: 'Also test' },
  });
});

export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => {
    const session = await useSession();
    const users = await prisma.user.findMany();

    return {
      session,
      users,
    };
  },
});

function Home() {
  const state = Route.useLoaderData();

  return (
    <main>
      <button onClick={() => createUser()}>Add User</button>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </main>
  );
}
