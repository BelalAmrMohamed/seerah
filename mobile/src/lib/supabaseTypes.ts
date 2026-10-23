export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      reading_progress: {
        Row: {
          id: string;
          user_id: string;
          station_id: number;
          scroll_percent: number;
          completed: boolean;
          bookmarked: boolean;
          notes: string | null;
          last_read_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          station_id: number;
          scroll_percent?: number;
          completed?: boolean;
          bookmarked?: boolean;
          notes?: string | null;
          last_read_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          station_id?: number;
          scroll_percent?: number;
          completed?: boolean;
          bookmarked?: boolean;
          notes?: string | null;
          last_read_at?: string;
          created_at?: string;
        };
      };
      ai_conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string | null;
          created_at?: string;
        };
      };
      ai_messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: "user" | "assistant";
          content: string;
          station_context: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: "user" | "assistant";
          content: string;
          station_context?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: "user" | "assistant";
          content?: string;
          station_context?: number | null;
          created_at?: string;
        };
      };
      highlights: {
        Row: {
          id: string;
          user_id: string;
          station_id: number;
          text_fragment: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          station_id: number;
          text_fragment: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          station_id?: number;
          text_fragment?: string;
          color?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
