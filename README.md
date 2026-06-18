# Silver News Telegram Bot (Next.js)

This project fetches topic-based news from `newsdata.io`, deduplicates articles per user/topic, and sends a digest to Telegram subscribers on each cron run.

## Prerequisites

- Node.js 20+
- Supabase project
- Telegram bot token
- NewsData API key

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment template:

```bash
cp .env.example .env.local
```

3. Fill `.env.local`:

```env
NEWSDATA_API_KEY=
TELEGRAM_BOT_TOKEN=
CRON_SECRET=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
TELEGRAM_WEBHOOK_SECRET=
```

4. Run SQL from [supabase/schema.sql](/D:/Practice 1/telegram_bot/news_bot/supabase/schema.sql) in Supabase SQL Editor.

5. Start app:

```bash
npm run dev
```

## API Routes

- `POST /api/subscribe` with body `{ "chatId": "123456789" }`
- `POST /api/unsubscribe` with body `{ "chatId": "123456789" }`
- `GET /api/subscribers/count`
- `POST /api/telegram/webhook` for Telegram `/start`, `/stop`, and `/settopic <topic>`
- `POST /api/cron/silver-news` with header `Authorization: Bearer <CRON_SECRET>`

## Cron Trigger

Use any external scheduler to call:

- Method: `POST`
- URL: `https://<your-domain>/api/cron/silver-news`
- Header: `Authorization: Bearer <CRON_SECRET>`

Example schedule: every 30 minutes.

## Telegram Webhook

Set webhook once:

```bash
curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"https://<your-domain>/api/telegram/webhook\",\"secret_token\":\"<TELEGRAM_WEBHOOK_SECRET>\"}"
```

Users can then send:

- `/start` to subscribe
- `/settopic <topic>` to customize their feed (default topic is `silver`)
- `/stop` to unsubscribe
