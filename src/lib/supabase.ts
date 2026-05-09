import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";
import { getEnv } from "@/lib/env";

let client: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient() {
  if (client) return client;
  const env = getEnv();

  client = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return client;
}
