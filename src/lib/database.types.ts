export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      run_logs: {
        Row: {
          id: number;
          started_at: string;
          finished_at: string;
          fetched_count: number;
          new_count: number;
          sent_count: number;
          status: string;
          error_text: string | null;
        };
        Insert: {
          id?: never;
          started_at: string;
          finished_at: string;
          fetched_count?: number;
          new_count?: number;
          sent_count?: number;
          status: string;
          error_text?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["run_logs"]["Insert"]>;
        Relationships: [];
      };
      subscribers: {
        Row: {
          chat_id: string;
          created_at: string;
          preferred_topic: string | null;
        };
        Insert: {
          chat_id: string;
          created_at?: string;
          preferred_topic?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["subscribers"]["Insert"]>;
        Relationships: [];
      };
      sent_articles: {
        Row: {
          article_key: string;
          published_at: string | null;
          sent_at: string;
        };
        Insert: {
          article_key: string;
          published_at?: string | null;
          sent_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sent_articles"]["Insert"]>;
        Relationships: [];
      };
      user_sent_articles: {
        Row: {
          article_key: string;
          chat_id: string;
          sent_at: string;
          topic: string;
        };
        Insert: {
          article_key: string;
          chat_id: string;
          sent_at?: string;
          topic: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_sent_articles"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
