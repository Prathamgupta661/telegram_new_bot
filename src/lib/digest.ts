import type { NewsArticle } from "@/lib/types";

export function formatDigest(articles: NewsArticle[]): string {
  const timestamp = new Date().toISOString();
  const header = `Silver News Digest\n${timestamp}\nNew items: ${articles.length}\n`;
  const lines = articles.map((article, index) => {
    const sourceSuffix = article.sourceName ? ` (${article.sourceName})` : "";
    return `${index + 1}. ${article.title}${sourceSuffix}\n${article.link}`;
  });

  return `${header}\n${lines.join("\n\n")}`;
}

