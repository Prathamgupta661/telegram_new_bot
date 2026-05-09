import { NextRequest, NextResponse } from "next/server";

import { isCronAuthorized } from "@/lib/auth";
import { formatDigest } from "@/lib/digest";
import { fetchSilverNews } from "@/lib/newsdata";
import { writeRunLog } from "@/lib/run-logs";
import { getExistingArticleKeys, persistSentArticles } from "@/lib/sent-articles";
import { listSubscribers } from "@/lib/subscribers";
import { sendDigest } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isCronAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const startedAt = new Date().toISOString();

  try {
    const allArticles = await fetchSilverNews();
    const existingKeys = await getExistingArticleKeys(allArticles.map((article) => article.key));
    const newArticles = allArticles.filter((article) => !existingKeys.has(article.key));
    const pickedArticles = newArticles.slice(0, 10);

    if (!pickedArticles.length) {
      await writeRunLog({
        startedAt,
        finishedAt: new Date().toISOString(),
        fetchedCount: allArticles.length,
        newCount: 0,
        sentCount: 0,
        status: "no_new_items",
      });
      return NextResponse.json({ ok: true, message: "No new silver news." });
    }

    await persistSentArticles(pickedArticles);
    const subscribers = await listSubscribers();
    const digest = formatDigest(pickedArticles);

    let sentCount = 0;
    const failedChatIds: string[] = [];
    for (const chatId of subscribers) {
      try {
        await sendDigest(chatId, digest);
        sentCount += 1;
      } catch {
        failedChatIds.push(chatId);
      }
    }

    await writeRunLog({
      startedAt,
      finishedAt: new Date().toISOString(),
      fetchedCount: allArticles.length,
      newCount: pickedArticles.length,
      sentCount,
      status: failedChatIds.length ? "partial" : "success",
      errorText: failedChatIds.length ? `Failed chat IDs: ${failedChatIds.join(", ")}` : null,
    });

    return NextResponse.json({
      ok: true,
      fetchedCount: allArticles.length,
      newCount: pickedArticles.length,
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

