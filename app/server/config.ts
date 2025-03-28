import 'dotenv';
import { type TypeOf, z } from 'zod';

const configSchema = z.object({
  session: z.object({
    secret: z.string(),
  }),
});

const rawConfig = {
  session: { secret: process.env.SESSION_SECRET },
} as TypeOf<typeof configSchema>;

// TODO how to keep this file out of the client bundle?
// const config = configSchema.parse(rawConfig);

export default rawConfig;
