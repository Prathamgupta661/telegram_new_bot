import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getEnv } from "@/lib/env";
import { addSubscriber, getSubscriberTopic, removeSubscriber, setSubscriberTopic } from "@/lib/subscribers";
import { sendDigest } from "@/lib/telegram";

const telegramUpdateSchema = z.object({
  message: z
    .object({
      text: z.string().optional(),
      chat: z.object({
        id: z.union([z.number(), z.string()]),
      }),
    })
    .optional(),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const topicInputSchema = z.string().trim().min(1).max(60).transform((value) => value.replace(/\s+/g, " "));
const validTopicPattern = /^[a-z0-9]+(?: [a-z0-9]+){0,2}$/i;

function parseCommand(messageText: string): { command: string; args: string } {
  const trimmed = messageText.trim();
  const firstSpaceIndex = trimmed.indexOf(" ");
  const commandToken = firstSpaceIndex === -1 ? trimmed : trimmed.slice(0, firstSpaceIndex);
  const args = firstSpaceIndex === -1 ? "" : trimmed.slice(firstSpaceIndex + 1);
  const normalizedCommand = commandToken.split("@")[0]?.toLowerCase() ?? "";
  return { command: normalizedCommand, args };
}

export async function POST(request: NextRequest) {
  const env = getEnv();
  const configuredSecret = env.TELEGRAM_WEBHOOK_SECRET;
  if (configuredSecret) {
    const providedSecret = request.headers.get("x-telegram-bot-api-secret-token");
    if (providedSecret !== configuredSecret) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const payload = telegramUpdateSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ ok: true });
  }

  const message = payload.data.message;
  if (!message?.text) {
    return NextResponse.json({ ok: true });
  }

  const chatId = String(message.chat.id);
  const { command, args } = parseCommand(message.text);

  if (command === "/start") {
    await addSubscriber(chatId);
    const topic = await getSubscriberTopic(chatId);
    await sendDigest(chatId, `Subscribed. You will receive ${topic} news digests.`);
  } else if (command === "/stop") {
    await removeSubscriber(chatId);
    await sendDigest(chatId, "Unsubscribed. No more news digests will be sent.");
  } else if (command === "/settopic") {
    const parsedTopic = topicInputSchema.safeParse(args);
    if (!parsedTopic.success || !validTopicPattern.test(parsedTopic.data)) {
      await sendDigest(chatId, "Invalid topic. Use /settopic <1-3 words> (letters and numbers only). Example: /settopic gold price");
      return NextResponse.json({ ok: true });
    }

    const normalizedTopic = parsedTopic.data.toLowerCase();
    await setSubscriberTopic(chatId, normalizedTopic);
    await sendDigest(chatId, `Topic updated to: ${normalizedTopic}`);
  }

  return NextResponse.json({ ok: true });
}
