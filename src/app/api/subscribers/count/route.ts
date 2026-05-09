import { NextResponse } from "next/server";

import { listSubscribers } from "@/lib/subscribers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const subscribers = await listSubscribers();
    return NextResponse.json({ ok: true, count: subscribers.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

