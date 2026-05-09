import { getSupabaseClient } from "@/lib/supabase";
import type { NewsArticle } from "@/lib/types";

export async function getExistingArticleKeys(keys: string[]): Promise<Set<string>> {
  if (!keys.length) return new Set<string>();

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("sent_articles")
    .select("article_key")
    .in("article_key", keys);

  if (error) {
    throw new Error(`Failed to read sent articles: ${error.message}`);
  }

  return new Set((data ?? []).map((row) => row.article_key as string));
}

export async function persistSentArticles(articles: NewsArticle[]): Promise<void> {
  if (!articles.length) return;

  const supabase = getSupabaseClient();
  const rows = articles.map((article) => ({
    article_key: article.key,
    published_at: article.pubDate,
  }));

  const { error } = await supabase
    .from("sent_articles")
    .upsert(rows, { onConflict: "article_key", ignoreDuplicates: true });

  if (error) {
    throw new Error(`Failed to persist sent articles: ${error.message}`);
  }
}
