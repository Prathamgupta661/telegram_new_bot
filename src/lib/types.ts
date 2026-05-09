export type NewsArticle = {
  key: string;
  title: string;
  link: string;
  pubDate: string | null;
  sourceName: string | null;
};

export type RunLogStatus = "success" | "partial" | "no_new_items" | "failed";

