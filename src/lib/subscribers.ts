import { getSupabaseClient } from "@/lib/supabase";

const DEFAULT_TOPIC = "silver";

export type SubscriberWithTopic = {
  chatId: string;
  topic: string;
};

function normalizeTopicOrDefault(topic: string | null | undefined): string {
  const normalized = (topic ?? "").trim().toLowerCase();
  return normalized || DEFAULT_TOPIC;
}

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

export async function listSubscribersWithTopics(): Promise<SubscriberWithTopic[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("subscribers").select("chat_id, preferred_topic");

  if (error) {
    throw new Error(`Failed to read subscribers: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    chatId: row.chat_id as string,
    topic: normalizeTopicOrDefault(row.preferred_topic),
  }));
}

export async function getSubscriberTopic(chatId: string): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("subscribers")
    .select("preferred_topic")
    .eq("chat_id", chatId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to read subscriber topic: ${error.message}`);
  }

  return normalizeTopicOrDefault(data?.preferred_topic);
}

export async function setSubscriberTopic(chatId: string, topic: string): Promise<void> {
  const normalizedTopic = topic.trim().toLowerCase();
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("subscribers").upsert(
    {
      chat_id: chatId,
      preferred_topic: normalizedTopic || DEFAULT_TOPIC,
    },
    { onConflict: "chat_id" },
  );

  if (error) {
    throw new Error(`Failed to update subscriber topic: ${error.message}`);
  }
}

export async function removeSubscriber(chatId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("subscribers").delete().eq("chat_id", chatId);
  if (error) {
    throw new Error(`Failed to remove subscriber: ${error.message}`);
  }
}
