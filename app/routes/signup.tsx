import { z } from 'zod';

import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

import AuthForm from '../components/AuthForm';

import { hashPassword, newSalt } from '../server/auth.server';
import { prisma } from '../server/db.server';
import { setLoggedIn, useSession } from '../server/session.server';

export const Route = createFileRoute('/signup')({
  component: Login,
});

const signupValidator = z.object({
  username: z.string(),
  password: z.string(),
});

const signup = createServerFn({ method: 'POST' })
  .validator(signupValidator)
  .handler(async ({ data: { username, password } }) => {
    const salt = newSalt();
    const [hashedPassword, session] = await Promise.all([
      hashPassword({ password, salt }),
      useSession(),
    ]);

    const user = await prisma.user.create({
      data: { username, hashedPassword, salt },
    });

    await setLoggedIn(session, user.id);
  });

function Login() {
  const router = useRouter();

  return (
    <main>
      <AuthForm
        submitText="Sign Up"
        onSubmit={(username, password) => {
          signup({
            data: {
              username,
              password,
            },
          }).then(() => {
            router.navigate({ to: '/' });
          });
        }}
      />
      <Link to={'/login'}>Log In</Link>
    </main>
  );
}
