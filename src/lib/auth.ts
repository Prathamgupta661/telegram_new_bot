import { getEnv } from "@/lib/env";

export function isCronAuthorized(authHeader: string | null): boolean {
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice("Bearer ".length).trim();
  const env = getEnv();
  return token === env.CRON_SECRET;
}
