export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 p-8">
      <main className="w-full max-w-3xl rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-neutral-900">
          Silver News Telegram Bot
        </h1>
        <p className="mt-3 text-neutral-600">
          Backend routes are ready for subscription, Telegram webhook, and cron-driven digest
          delivery.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-neutral-700">
          <li>
            POST <code>/api/subscribe</code>
          </li>
          <li>
            POST <code>/api/unsubscribe</code>
          </li>
          <li>
            POST <code>/api/telegram/webhook</code>
          </li>
          <li>
            POST <code>/api/cron/silver-news</code>
          </li>
        </ul>
      </main>
    </div>
  );
}
