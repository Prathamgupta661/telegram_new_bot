import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { removeSubscriber } from "@/lib/subscribers";

const bodySchema = z.object({
  chatId: z.string().min(1),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = bodySchema.parse(await request.json());
    await removeSubscriber(body.chatId);
    return NextResponse.json({ ok: true, unsubscribed: body.chatId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

