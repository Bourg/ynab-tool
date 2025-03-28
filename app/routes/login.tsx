import { createFileRoute, Link } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { useSession } from '../server/session.server';
import AuthForm from '../components/AuthForm';

export const Route = createFileRoute('/login')({
  component: Login,
});

const loginValidator = z.object({
  username: z.string(),
  password: z.string(),
});

const login = createServerFn({ method: 'POST' })
  .validator(loginValidator)
  .handler(async ({ data }) => {
    const session = await useSession();
  });

function Login() {
  return (
    <main>
      <AuthForm
        submitText="Log In"
        onSubmit={(username, password) => {
          login({
            data: {
              username,
              password,
            },
          });
        }}
      />
      <Link to={'/signup'}>Sign Up</Link>
    </main>
  );
}
