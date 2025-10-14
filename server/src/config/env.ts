import { z } from 'zod';

const rawEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  OPENAI_API_KEY: z.string().optional(),

  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_FROM_NUMBER: z.string().optional(),
  TWILIO_MESSAGING_SERVICE_SID: z.string().optional(),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().optional(),
  GOOGLE_PUBSUB_VERIFICATION_TOKEN: z.string().optional(),

  PUBLIC_WEB_APP_URL: z.string().optional(),
  SESSION_SECRET: z.string().optional()
});

type RawEnv = z.infer<typeof rawEnvSchema>;

export type AppConfig = {
  env: RawEnv['NODE_ENV'];
  port: number;
  logLevel: RawEnv['LOG_LEVEL'];
  databaseUrl: string;
  openai: {
    apiKey: string | null;
  };
  twilio: {
    accountSid: string | null;
    authToken: string | null;
    fromNumber: string | null;
    messagingServiceSid: string | null;
  };
  google: {
    clientId: string | null;
    clientSecret: string | null;
    redirectUri: string | null;
    pubsubVerificationToken: string | null;
  };
  publicWebAppUrl: string | null;
  sessionSecret: string | null;
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
};

let cachedConfig: AppConfig | null = null;

export const loadConfig = (): AppConfig => {
  if (cachedConfig) {
    return cachedConfig;
  }

  const parsed = rawEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    const formatted = parsed.error.flatten().fieldErrors;
    console.error('Invalid environment configuration', formatted);
    throw new Error('Invalid environment configuration');
  }

  const env = parsed.data;

  cachedConfig = {
    env: env.NODE_ENV,
    port: env.PORT,
    logLevel: env.LOG_LEVEL,
    databaseUrl: env.DATABASE_URL,
    openai: {
      apiKey: env.OPENAI_API_KEY ?? null
    },
    twilio: {
      accountSid: env.TWILIO_ACCOUNT_SID ?? null,
      authToken: env.TWILIO_AUTH_TOKEN ?? null,
      fromNumber: env.TWILIO_FROM_NUMBER ?? null,
      messagingServiceSid: env.TWILIO_MESSAGING_SERVICE_SID ?? null
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID ?? null,
      clientSecret: env.GOOGLE_CLIENT_SECRET ?? null,
      redirectUri: env.GOOGLE_REDIRECT_URI ?? null,
      pubsubVerificationToken: env.GOOGLE_PUBSUB_VERIFICATION_TOKEN ?? null
    },
    publicWebAppUrl: env.PUBLIC_WEB_APP_URL ?? null,
    sessionSecret: env.SESSION_SECRET ?? null,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test'
  };

  return cachedConfig;
};

export const getConfig = (): AppConfig => loadConfig();
