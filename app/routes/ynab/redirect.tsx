import { z } from 'zod';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { getAccessToken } from '../../server/ynab.server';
import { createServerFn } from '@tanstack/react-start';
import { authMiddleware } from '../../middleware';
import { useEffect, useRef } from 'react';
import { prisma } from '../../server/db.server';

const codeValidator = z.object({ code: z.string() });

const loadAccessToken = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ code: z.string(), origin: z.string() }))
  .handler(async ({ context: { user }, data }) => {
    const accessToken = await getAccessToken(data);

    await prisma.ynabIntegration.upsert({
      where: { userId: user.id },
      create: { ...accessToken, userId: user.id },
      update: accessToken,
    });
  });

export const Route = createFileRoute('/ynab/redirect')({
  validateSearch: zodValidator(codeValidator),
  component: Redirect,
});

function Redirect() {
  const router = useRouter();
  const { code } = Route.useSearch();

  const loadedAccessToken = useRef(false);
  useEffect(() => {
    if (loadedAccessToken.current) {
      return;
    }

    loadedAccessToken.current = true;
    loadAccessToken({ data: { code, origin: window.location.origin } }).then(
      () => router.navigate({ to: '/' }),
    );
  }, [code]);
}
