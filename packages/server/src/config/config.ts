import { z } from 'zod';

const ConfigSchema = z.object({
  LOCALSTACK_ENDPOINT: z.string().url().default('http://localstack:4566'),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().default('test'),
  AWS_SECRET_ACCESS_KEY: z.string().default('test'),
  PORT: z.coerce.number().int().positive().default(8080),
  NODE_ENV: z.string().default('development'),
});

export type AppConfig = z.infer<typeof ConfigSchema>;

export const loadConfig = (): AppConfig => {
  const parsed = ConfigSchema.safeParse(process.env);
  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join(', ');
    throw new Error(`Invalid configuration: ${message}`);
  }
  return parsed.data;
};
