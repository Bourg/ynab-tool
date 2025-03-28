import 'dotenv';

import { z } from 'zod';

const configSchema = z.object({
  session: z.object({
    secret: z.string(),
  }),
});

// TODO how to keep this file out of the client bundle?
const configServer = configSchema.parse({
  session: { secret: process.env.SESSION_SECRET },
});

export default configServer;
