alter table subscribers
add column if not exists preferred_topic text;

create table if not exists user_sent_articles (
  chat_id text not null,
  topic text not null,
  article_key text not null,
  sent_at timestamptz not null default now(),
  primary key (chat_id, topic, article_key)
);
