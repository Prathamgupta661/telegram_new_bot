import { getEnv } from "@/lib/env";

type TelegramSendResult = {
  ok: boolean;
  description?: string;
};

async function sendMessage(chatId: string, text: string): Promise<void> {
  const env = getEnv();
  const telegramSendMessageUrl = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;

  const response = await fetch(telegramSendMessageUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as TelegramSendResult | null;
    const description = payload?.description ?? `HTTP ${response.status}`;
    throw new Error(`Telegram send failed (${chatId}): ${description}`);
  }
}

export function chunkMessage(text: string, maxLength = 3900): string[] {
  if (text.length <= maxLength) return [text];

  const chunks: string[] = [];
  let current = "";

  for (const line of text.split("\n")) {
    const withLine = current ? `${current}\n${line}` : line;
    if (withLine.length > maxLength) {
      if (current) chunks.push(current);
      current = line;
    } else {
      current = withLine;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

export async function sendDigest(chatId: string, digest: string): Promise<void> {
  const chunks = chunkMessage(digest);
  for (const chunk of chunks) {
    await sendMessage(chatId, chunk);
  }
}
