import { createFileRoute, Link } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { updateSession } from '../server/session.server';
import AuthForm from '../components/AuthForm';
import { hashPassword, newSalt } from '../server/auth.server';
import { prisma } from '../server/db.server';

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
    const [hashedPassword] = await Promise.all([hashPassword(password, salt)]);

    const user = await prisma.user.create({
      data: { username, hashedPassword, salt },
    });

    await updateSession({ userId: user.id });
  });

function Login() {
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
          });
        }}
      />
      <Link to={'/login'}>Log In</Link>
    </main>
  );
}
