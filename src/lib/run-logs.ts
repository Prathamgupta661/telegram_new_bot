import { getSupabaseClient } from "@/lib/supabase";
import type { RunLogStatus } from "@/lib/types";

type RunLogInput = {
  startedAt: string;
  finishedAt: string;
  fetchedCount: number;
  newCount: number;
  sentCount: number;
  status: RunLogStatus;
  errorText?: string | null;
};

export async function writeRunLog(input: RunLogInput): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("run_logs").insert({
    started_at: input.startedAt,
    finished_at: input.finishedAt,
    fetched_count: input.fetchedCount,
    new_count: input.newCount,
    sent_count: input.sentCount,
    status: input.status,
    error_text: input.errorText ?? null,
  });

  if (error) {
    throw new Error(`Failed to write run log: ${error.message}`);
  }
}
