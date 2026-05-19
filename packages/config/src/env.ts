import { z } from 'zod';

export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
});

export const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:4000'),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

export function validateServerEnv(env: Record<string, string | undefined>): ServerEnv {
  const result = serverEnvSchema.safeParse(env);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    throw new Error(`Invalid server environment variables:\n${JSON.stringify(errors, null, 2)}`);
  }
  return result.data;
}

export function validateClientEnv(env: Record<string, string | undefined>): ClientEnv {
  const result = clientEnvSchema.safeParse(env);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    throw new Error(`Invalid client environment variables:\n${JSON.stringify(errors, null, 2)}`);
  }
  return result.data;
}
