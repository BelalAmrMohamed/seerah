import { API_BASE_URL } from "./env";

export type ChatHistoryItem = { role: "user" | "assistant"; content: string };

/**
 * Calls the website's deployed endpoint (the Gemini key stays on the server).
 * Same request/response contract as the website's AiChat component.
 */
export async function askAi(params: {
  message: string;
  stationContext?: number;
  history: ChatHistoryItem[];
}): Promise<{ response?: string; error?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  try {
    const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (data?.error) return { error: String(data.error) };
    if (!res.ok || typeof data?.response !== "string") return { error: "حدث خطأ في الاتصال بمحرك الذكاء. يرجى المحاولة مرة أخرى." };
    return { response: data.response };
  } catch {
    return { error: "حدث خطأ في الاتصال بمحرك الذكاء. يرجى المحاولة مرة أخرى." };
  } finally {
    clearTimeout(timer);
  }
}
