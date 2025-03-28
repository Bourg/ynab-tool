import config from './config.server';
import { getRedirectUri, tokenResponseValidator } from '../util/ynab';

export interface AccessTokenProps {
  code: string;
  origin: string;
}

export async function getAccessToken(props: AccessTokenProps) {
  const tokenUri = getAccessTokenUri(props);
  return fetchAndParseAccessToken(tokenUri);
}

export async function refreshAccessToken(refreshToken: string) {
  const tokenUri = getRefreshTokenUri(refreshToken);
  return fetchAndParseAccessToken(tokenUri);
}

export function getAccessTokenUri({ code, origin }: AccessTokenProps) {
  const params = new URLSearchParams();
  params.set('client_id', config.ynab.oauth.clientId);
  params.set('client_secret', config.ynab.oauth.clientSecret);
  params.set('redirect_uri', getRedirectUri({ origin }));
  params.set('grant_type', 'authorization_code');
  params.set('code', code);

  return `${config.ynab.oauth.tokenUri}?${params.toString()}`;
}

export function getRefreshTokenUri(refreshToken: string) {
  const params = new URLSearchParams();
  params.set('client_id', config.ynab.oauth.clientId);
  params.set('client_secret', config.ynab.oauth.clientSecret);
  params.set('grant_type', 'refresh_token');
  params.set('refresh_token', refreshToken);

  return `${config.ynab.oauth.tokenUri}?${params.toString()}`;
}

async function fetchAndParseAccessToken(tokenUri: string) {
  const { created_at, expires_in, access_token, refresh_token } =
    await fetchToken(tokenUri);

  const createdAt = new Date(created_at * 1000);
  const expiresAt = new Date(createdAt);
  expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

  return {
    accessToken: access_token,
    refreshToken: refresh_token,
    createdAt: createdAt,
    expiresAt: expiresAt,
    expiresIn: expires_in,
  };
}

async function fetchToken(tokenUri: string) {
  const tokenResponse = await fetch(tokenUri, { method: 'POST' });
  if (!tokenResponse.ok) {
    throw new Error('Failed to get access token');
  }

  return await tokenResponse
    .json()
    .then((json) => tokenResponseValidator.parse(json));
}
