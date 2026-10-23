import "react-native-url-polyfill/auto";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";
import type { Database } from "./supabaseTypes";

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Uses ONLY the public anon key (protected by Row Level Security on the server).
export const supabase = createClient<Database>(
  supabaseConfigured ? SUPABASE_URL : "https://placeholder.supabase.co",
  supabaseConfigured ? SUPABASE_ANON_KEY : "placeholder-anon-key",
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: "pkce",
    },
  }
);

// Refresh tokens only while the app is in the foreground (Supabase RN recommendation).
AppState.addEventListener("change", (state) => {
  if (!supabaseConfigured) return;
  if (state === "active") supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});
