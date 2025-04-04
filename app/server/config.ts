import { config as configDotenv } from 'dotenv';
import { z } from 'zod';

configDotenv();

const configSchema = z.object({
  auth: z.object({
    saltLengthBytes: z.number(),
    keyLengthBytes: z.number(),
    iterations: z.number(),
  }),
  ynab: z.object({
    oauth: z.object({
      authorizeUri: z.string(),
      tokenUri: z.string(),
      clientId: z.string(),
      clientSecret: z.string(),
    }),
  }),
  session: z.object({
    secret: z.string(),
  }),
});

const config = configSchema.parse({
  auth: { saltLengthBytes: 32, keyLengthBytes: 128, iterations: 654321 },
  ynab: {
    oauth: {
      authorizeUri: process.env.YNAB_AUTHORIZE_URI,
      tokenUri: process.env.YNAB_TOKEN_URI,
      clientId: process.env.YNAB_CLIENT_ID,
      clientSecret: process.env.YNAB_CLIENT_SECRET,
    },
  },
  session: { secret: process.env.SESSION_SECRET },
});

export default config;
