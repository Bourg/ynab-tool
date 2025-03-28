import { useSession as _useSession } from '@tanstack/react-start/server';

import config from './config';

export async function useSession() {
  return _useSession({
    password: config.session.secret,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    },
  });
}
