import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getEnv } from "@/lib/env";
import { addSubscriber, removeSubscriber } from "@/lib/subscribers";
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
  const command = message.text.trim().split(" ")[0]?.toLowerCase();

  if (command === "/start") {
    await addSubscriber(chatId);
    await sendDigest(chatId, "Subscribed. You will receive silver news digests.");
  } else if (command === "/stop") {
    await removeSubscriber(chatId);
    await sendDigest(chatId, "Unsubscribed. No more silver news digests will be sent.");
  }

  return NextResponse.json({ ok: true });
}
