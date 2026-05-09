create table if not exists subscribers (
  chat_id text primary key,
  created_at timestamptz not null default now()
);

create table if not exists sent_articles (
  article_key text primary key,
  published_at timestamptz null,
  sent_at timestamptz not null default now()
);

create table if not exists run_logs (
  id bigint generated always as identity primary key,
  started_at timestamptz not null,
  finished_at timestamptz not null,
  fetched_count integer not null default 0,
  new_count integer not null default 0,
  sent_count integer not null default 0,
  status text not null,
  error_text text null
);

