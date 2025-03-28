import { useSession as _useSession } from '@tanstack/react-start/server';

import configServer from './config.server';

export async function useSession() {
  return _useSession({
    password: configServer.session.secret,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    },
  });
}
