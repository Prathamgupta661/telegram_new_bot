import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { addSubscriber } from "@/lib/subscribers";

const bodySchema = z.object({
  chatId: z.string().min(1),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = bodySchema.parse(await request.json());
    await addSubscriber(body.chatId);
    return NextResponse.json({ ok: true, subscribed: body.chatId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

