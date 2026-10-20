const API_BASE =
  process.env.EXPO_PUBLIC_API_URL || "https://al-seerah.vercel.app";

export interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

export interface SendMessageOptions {
  message: string;
  stationContext?: number;
  history?: ChatHistoryItem[];
}

export async function sendAiChatMessage({
  message,
  stationContext,
  history,
}: SendMessageOptions): Promise<{ response?: string; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

    const res = await fetch(`${API_BASE}/api/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        stationContext,
        history,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      return {
        error: errorData?.error || `فشل الاتصال بالخادم (${res.status})`,
      };
    }

    const data = await res.json();
    if (data.error) {
      return { error: data.error };
    }

    return { response: data.response };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      return {
        error: "استغرقت الاستجابة وقتاً أطول من المتوقع، يرجى المحاولة مرة أخرى.",
      };
    }
    return {
      error:
        "تعذر الاتصال بمساعد السيرة. يرجى التأكد من اتصال الإنترنت والمحاولة لاحقاً.",
    };
  }
}
