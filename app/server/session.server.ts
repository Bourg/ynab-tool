import {
  useSession as _useSession,
  updateSession as _updateSession,
} from '@tanstack/react-start/server';

import config from './config.server';

const sessionConfig = {
  password: config.session.secret,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  },
} as const;

export async function useSession() {
  return _useSession(sessionConfig);
}

export async function updateSession(
  update: Parameters<typeof _updateSession>[2],
) {
  return _updateSession(sessionConfig, update);
}
