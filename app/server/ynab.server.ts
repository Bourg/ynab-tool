import config from './config.server';
import { getRedirectUri } from '../util/ynab';

export function getTokenUri({
  code,
  origin,
}: {
  code: string;
  origin: string;
}) {
  const params = new URLSearchParams();
  params.set('client_id', config.ynab.oauth.clientId);
  params.set('client_secret', config.ynab.oauth.clientSecret);
  params.set('redirect_uri', getRedirectUri({ origin }));
  params.set('grant_type', 'authorization_code');
  params.set('code', code);

  return `${config.ynab.oauth.tokenUri}?${params.toString()}`;
}
