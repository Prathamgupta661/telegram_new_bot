import { getSupabaseClient } from "@/lib/supabase";

export async function listSubscribers(): Promise<string[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("subscribers").select("chat_id");
  if (error) {
    throw new Error(`Failed to read subscribers: ${error.message}`);
  }

  return (data ?? []).map((row) => row.chat_id as string);
}

export async function addSubscriber(chatId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("subscribers").upsert(
    {
      chat_id: chatId,
    },
    { onConflict: "chat_id" },
  );

  if (error) {
    throw new Error(`Failed to add subscriber: ${error.message}`);
  }
}

export async function removeSubscriber(chatId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("subscribers").delete().eq("chat_id", chatId);
  if (error) {
    throw new Error(`Failed to remove subscriber: ${error.message}`);
  }
}
