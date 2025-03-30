import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

import AuthForm from '~/components/AuthForm';
import { isCorrectPassword } from '~/server/auth';
import { prisma } from '~/server/db';
import { setLoggedIn, useSession } from '~/server/session';

export const Route = createFileRoute('/login')({
  component: Login,
});

const loginValidator = z.object({
  username: z.string(),
  password: z.string(),
});

const login = createServerFn({ method: 'POST' })
  .validator(loginValidator)
  .handler(async ({ data: { username, password } }) => {
    const user = await prisma.user.findUnique({ where: { username } });
    if (user == null) {
      throw new Error('Could not log in');
    }

    const passwordIsCorrect = await isCorrectPassword({
      providedPassword: password,
      expectedHashedPassword: user.hashedPassword,
      salt: user.salt,
    });

    if (passwordIsCorrect) {
      const session = await useSession();
      await setLoggedIn(session, user.id);
    } else {
      throw Error('Could not log in');
    }
  });

function Login() {
  const router = useRouter();

  return (
    <main>
      <AuthForm
        variant="login"
        onSubmit={(username, password) => {
          login({
            data: {
              username,
              password,
            },
          }).then(() => router.navigate({ to: '/' }));
        }}
      />
      <Link to={'/signup'}>Sign Up</Link>
    </main>
  );
}
