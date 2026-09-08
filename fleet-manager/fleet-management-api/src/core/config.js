import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(8080),
  LOG_LEVEL: z.enum(['info', 'debug', 'error', 'warn']).default('info'),
  API_KEY: z.string().default('secret-api-key'),
  ALLOWED_ORIGINS: z.string().transform(s => s.split(',')).default('http://localhost:3000,http://localhost:8080'),
  RATE_LIMIT_POINTS: z.coerce.number().default(100),
  RATE_LIMIT_DURATION: z.coerce.number().default(60),
});

const env = envSchema.parse(process.env);

export const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  logLevel: env.LOG_LEVEL,
  apiKey: env.API_KEY,
  allowedOrigins: env.ALLOWED_ORIGINS,
  rateLimit: {
    points: env.RATE_LIMIT_POINTS,
    duration: env.RATE_LIMIT_DURATION
  }
};
