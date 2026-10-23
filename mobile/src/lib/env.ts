// Only PUBLIC values. No Gemini / Google AI key, no service-role key — ever.
// The AI key lives only on the website's server (Vercel env GOOGLE_AI_API_KEY).
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://al-seerah.vercel.app").replace(/\/$/, "");
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const SHAMELA_BOOK_URL = "https://shamela.ws/book/23833";
