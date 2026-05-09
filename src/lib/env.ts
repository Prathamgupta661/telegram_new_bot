import { z } from "zod";

const envSchema = z.object({
  NEWSDATA_API_KEY: z.string().min(1),
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  CRON_SECRET: z.string().min(1),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  TELEGRAM_WEBHOOK_SECRET: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;

  cachedEnv = envSchema.parse({
    NEWSDATA_API_KEY: process.env.NEWSDATA_API_KEY,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    CRON_SECRET: process.env.CRON_SECRET,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    TELEGRAM_WEBHOOK_SECRET: process.env.TELEGRAM_WEBHOOK_SECRET,
  });

  return cachedEnv;
}
