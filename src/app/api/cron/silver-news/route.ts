import { NextRequest, NextResponse } from "next/server";

import { isCronAuthorized } from "@/lib/auth";
import { formatDigest } from "@/lib/digest";
import { fetchNewsByTopic } from "@/lib/newsdata";
import { writeRunLog } from "@/lib/run-logs";
import { listSubscribersWithTopics } from "@/lib/subscribers";
import { sendDigest } from "@/lib/telegram";
import { getExistingUserTopicArticleKeys, persistUserSentArticles } from "@/lib/user-sent-articles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ARTICLES_PER_DIGEST = 10;

export async function POST(request: NextRequest) {
  if (!isCronAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const startedAt = new Date().toISOString();

  try {
    const subscribers = await listSubscribersWithTopics();
    const topics = Array.from(new Set(subscribers.map((subscriber) => subscriber.topic)));
    const topicArticles = new Map<string, Awaited<ReturnType<typeof fetchNewsByTopic>>>();

    let fetchedCount = 0;
    for (const topic of topics) {
      const articles = await fetchNewsByTopic(topic);
      topicArticles.set(topic, articles);
      fetchedCount += articles.length;
    }

    let sentCount = 0;
    let newCount = 0;
    const failedChatIds: string[] = [];

    for (const subscriber of subscribers) {
      const topic = subscriber.topic;
      const chatId = subscriber.chatId;
      const articles = topicArticles.get(topic) ?? [];
      const existingKeys = await getExistingUserTopicArticleKeys(
        chatId,
        topic,
        articles.map((article) => article.key),
      );
      const unseenArticles = articles
        .filter((article) => !existingKeys.has(article.key))
        .slice(0, MAX_ARTICLES_PER_DIGEST);

      const message = unseenArticles.length
        ? formatDigest(topic, unseenArticles)
        : `No new news found for ${topic}. Wait for next update.`;

      try {
        await sendDigest(chatId, message);
        if (unseenArticles.length) {
          await persistUserSentArticles(chatId, topic, unseenArticles);
          newCount += unseenArticles.length;
        }
        sentCount += 1;
      } catch {
        failedChatIds.push(chatId);
      }
    }

    await writeRunLog({
      startedAt,
      finishedAt: new Date().toISOString(),
      fetchedCount,
      newCount,
      sentCount,
      status: failedChatIds.length ? "partial" : newCount === 0 ? "no_new_items" : "success",
      errorText: failedChatIds.length ? `Failed chat IDs: ${failedChatIds.join(", ")}` : null,
    });

    return NextResponse.json({
      ok: true,
      fetchedCount,
      newCount,
      topicCount: topics.length,
      subscriberCount: subscribers.length,
      sentCount,
      failedChatIds,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await writeRunLog({
      startedAt,
      finishedAt: new Date().toISOString(),
      fetchedCount: 0,
      newCount: 0,
      sentCount: 0,
      status: "failed",
      errorText: message,
    }).catch(() => undefined);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
