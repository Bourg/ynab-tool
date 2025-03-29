import { useSession as _useSession } from '@tanstack/react-start/server';

import config from './config.server';
import { User } from '@prisma/client';

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

export type Session = Awaited<ReturnType<typeof useSession>>;

export function getLoggedInUserId(session: Session): User['id'] | null {
  return session.data.userId ?? null;
}

export async function setLoggedIn(
  session: Session,
  userId: User['id'],
): Promise<void> {
  await session.update((prev) => {
    return { ...prev, userId };
  });
}
