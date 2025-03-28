import { TypeOf, z } from 'zod';

export function getAuthorizeUri({
  origin,
  authorizeUri,
  clientId,
}: {
  origin: string;
  authorizeUri: string;
  clientId: string;
}) {
  const params = new URLSearchParams();
  params.set('client_id', clientId);
  params.set('redirect_uri', getRedirectUri({ origin }));
  params.set('response_type', 'code');

  return `${authorizeUri}?${params.toString()}`;
}

export const tokenResponseValidator = z.object({
  access_token: z.string(),
  token_type: z.literal('Bearer'),
  refresh_token: z.string(),
  expires_in: z.number(),
  scope: z.string(),
  created_at: z.number(),
});

type TokenResponse = TypeOf<typeof tokenResponseValidator>;

export function getRedirectUri({ origin }: { origin: string }) {
  return `${origin}/ynab/redirect`;
}
