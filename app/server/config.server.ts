import 'dotenv';

import { z } from 'zod';

const configSchema = z.object({
  auth: z.object({
    saltLengthBytes: z.number(),
    keyLengthBytes: z.number(),
    iterations: z.number(),
  }),
  session: z.object({
    secret: z.string(),
  }),
});

const config = configSchema.parse({
  auth: { saltLengthBytes: 32, keyLengthBytes: 128, iterations: 654321 },
  session: { secret: process.env.SESSION_SECRET },
});

export default config;
