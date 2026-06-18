import { z } from "zod";

import { getEnv } from "@/lib/env";
import { sha256 } from "@/lib/hash";
import type { NewsArticle } from "@/lib/types";

const newsItemSchema = z.object({
  article_id: z.string().optional(),
  title: z.string().optional(),
  link: z.string().optional(),
  pubDate: z.string().optional(),
  source_name: z.string().optional(),
  description: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
});

const newsResponseSchema = z.object({
  status: z.string(),
  results: z.array(newsItemSchema).optional(),
});

function buildArticleKey(item: z.infer<typeof newsItemSchema>): string {
  if (item.article_id) return item.article_id;

  const seed = `${item.title ?? ""}|${item.link ?? ""}|${item.pubDate ?? ""}`;
  return sha256(seed);
}

const COMMODITY_CONTEXT_TERMS = [
  "xag",
  "xagusd",
  "bullion",
  "precious metal",
  "silver price",
  "spot silver",
  "silver futures",
  "commodity",
  "commodities",
  "metals",
  "mine",
  "mining",
  "refinery",
  "lbma",
  "comex",
];

const NOISE_TERMS = [
  "silver alert",
  "silverado",
  "silverstone",
  "hair",
  "jewellery",
  "jewelry",
  "wedding",
  "netflix",
  "movie",
  "tour",
  "football",
  "weather",
  "dog",
  "teacher",
];

function isLikelySilverCommodityArticle(item: z.infer<typeof newsItemSchema>): boolean {
  const haystack = `${item.title ?? ""}\n${item.description ?? ""}\n${item.content ?? ""}`.toLowerCase();
  const hasSilverWord = /\bsilver\b|\bxag\b/.test(haystack);
  if (!hasSilverWord) return false;

  const hasContext = COMMODITY_CONTEXT_TERMS.some((term) => haystack.includes(term));
  if (!hasContext) return false;

  const hasNoise = NOISE_TERMS.some((term) => haystack.includes(term));
  return !hasNoise;
}

function normalizeTopic(topic: string): string {
  return topic.trim().toLowerCase() || "silver";
}

export async function fetchNewsByTopic(topic: string): Promise<NewsArticle[]> {
  const normalizedTopic = normalizeTopic(topic);
  const env = getEnv();
  const url = new URL("https://newsdata.io/api/1/latest");
  url.searchParams.set("apikey", env.NEWSDATA_API_KEY);
  url.searchParams.set("qInTitle", normalizedTopic);
  url.searchParams.set("language", "en");

  if (normalizedTopic === "silver") {
    url.searchParams.set("category", "business");
  }

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`NewsData request failed: ${response.status}`);
  }

  const payload = newsResponseSchema.parse(await response.json());
  const items = payload.results ?? [];
  const shouldApplySilverFilter = normalizedTopic === "silver";

  return items
    .filter(
      (item) =>
        Boolean(item.title) &&
        Boolean(item.link) &&
        (!shouldApplySilverFilter || isLikelySilverCommodityArticle(item)),
    )
    .map((item) => ({
      key: buildArticleKey(item),
      title: item.title as string,
      link: item.link as string,
      pubDate: item.pubDate ?? null,
      sourceName: item.source_name ?? null,
    }));
}

export async function fetchSilverNews(): Promise<NewsArticle[]> {
  return fetchNewsByTopic("silver");
}
