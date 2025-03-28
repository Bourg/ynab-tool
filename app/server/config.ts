import 'dotenv';

import { z } from 'zod';

const configSchema = z.object({
  session: z.object({
    secret: z.string(),
  }),
});

const config = configSchema.parse({
  session: { secret: process.env.SESSION_SECRET },
});

export default config;
