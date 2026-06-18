import type { NewsArticle } from "@/lib/types";
import { getSupabaseClient } from "@/lib/supabase";

export async function getExistingUserTopicArticleKeys(
  chatId: string,
  topic: string,
  keys: string[],
): Promise<Set<string>> {
  if (!keys.length) return new Set<string>();

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("user_sent_articles")
    .select("article_key")
    .eq("chat_id", chatId)
    .eq("topic", topic)
    .in("article_key", keys);

  if (error) {
    throw new Error(`Failed to read user sent articles: ${error.message}`);
  }

  return new Set((data ?? []).map((row) => row.article_key as string));
}

export async function persistUserSentArticles(
  chatId: string,
  topic: string,
  articles: NewsArticle[],
): Promise<void> {
  if (!articles.length) return;

  const supabase = getSupabaseClient();
  const rows = articles.map((article) => ({
    chat_id: chatId,
    topic,
    article_key: article.key,
  }));

  const { error } = await supabase
    .from("user_sent_articles")
    .upsert(rows, { onConflict: "chat_id,topic,article_key", ignoreDuplicates: true });

  if (error) {
    throw new Error(`Failed to persist user sent articles: ${error.message}`);
  }
}
