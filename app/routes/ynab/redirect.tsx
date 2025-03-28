import { z } from 'zod';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { getTokenUri } from '../../server/ynab.server';
import { createServerFn } from '@tanstack/react-start';
import { authMiddleware } from '../../middleware';
import { useEffect, useRef } from 'react';
import { tokenResponseValidator } from '../../util/ynab';
import { prisma } from '../../server/db.server';

const codeValidator = z.object({ code: z.string() });

const getAccessToken = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ code: z.string(), origin: z.string() }))
  .handler(async ({ context: { user }, data }) => {
    const tokenUri = getTokenUri(data);
    const tokenResponse = await fetch(tokenUri, { method: 'POST' });
    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token');
    }

    const { access_token, refresh_token, created_at, expires_in } =
      await tokenResponse
        .json()
        .then((json) => tokenResponseValidator.parse(json));

    const createdAt = new Date(created_at * 1000);

    const expiresAt = new Date(createdAt);
    expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

    const patch = {
      accessToken: access_token,
      refreshToken: refresh_token,
      createdAt,
      expiresAt,
    } as const;

    await prisma.ynabIntegration.upsert({
      where: { userId: user.id },
      create: { ...patch, userId: user.id },
      update: patch,
    });
  });

export const Route = createFileRoute('/ynab/redirect')({
  validateSearch: zodValidator(codeValidator),
  component: Redirect,
});

function Redirect() {
  const router = useRouter();
  const { code } = Route.useSearch();

  const gotAccessTokenRef = useRef(false);
  useEffect(() => {
    if (gotAccessTokenRef.current) {
      return;
    }

    gotAccessTokenRef.current = true;
    getAccessToken({ data: { code, origin: window.location.origin } }).then(
      () => router.navigate({ to: '/' }),
    );
  }, [code]);
}
