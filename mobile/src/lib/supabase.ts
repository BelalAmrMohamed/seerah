import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL || "https://zvncdynpihzkzaevbhhb.supabase.co";
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2bmNkeW5waWh6a3phZXZiaGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0MTgxOTYsImV4cCI6MjEwNzk5NDE5Nn0.eFSBuq9oJJ2Z-xuhSGZmeYdFnai6bomyyDOH858ZAJI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
