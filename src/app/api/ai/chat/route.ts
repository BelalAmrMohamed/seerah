import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { stations } from "@/lib/stations";

const SYSTEM_PROMPT = `أنت مساعد متخصص في السيرة النبوية من كتاب "السيرة النبوية" لابن هشام.
تجيب على الأسئلة بالعربية الفصحى بأسلوب واضح ومحترم ومختصر.
تستند إلى نصوص ابن هشام في السيرة النبوية.
إذا لم تكن متأكداً من معلومة، أشر إلى ذلك بوضوح.
لا تخترع أحاديث أو أقوال. استند فقط إلى ما هو ثابت في المصادر المعتمدة.
عند الإشارة إلى النبي محمد، استخدم: ﷺ
أجب بإيجاز ووضوح. لا تطل في الإجابة إلا إذا طُلب منك ذلك.`;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "لم يتم تكوين مفتاح API. يرجى إضافة GOOGLE_AI_API_KEY." },
        { status: 500 }
      );
    }

    const { message, stationContext, history } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "الرسالة مطلوبة" }, { status: 400 });
    }

    // Build context from station data if provided
    let context = "";
    if (stationContext && typeof stationContext === "number") {
      const station = stations.find((s) => s.id === stationContext);
      if (station) {
        context = `\n\nسياق المحطة الحالية (محطة رقم ${station.id}):
العنوان: ${station.title}
التصنيف: ${station.category}
السنة: ${station.year} (${station.hijriYear})
المكان: ${station.location}
الوصف: ${station.description}
الاقتباس: ${station.quote}
الشخصيات: ${station.keyFigures.join("، ")}
الأهمية: ${station.significance}
النص: ${station.bookContent.slice(0, 1000)}`;
      }
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

    // Build multi-turn contents array with system instruction & past history
    const contents: { role: string; parts: { text: string }[] }[] = [
      { role: "user", parts: [{ text: SYSTEM_PROMPT + context }] },
      { role: "model", parts: [{ text: "أهلاً بك، أنا جاهز للإجابة بدقة عن أحداث وشخصيات السيرة النبوية الشريفة استناداً إلى كتاب ابن هشام." }] },
    ];

    if (Array.isArray(history)) {
      // Include last 8 turns max to conserve context tokens and maintain speed
      const recentHistory = history.slice(-8);
      for (const h of recentHistory) {
        if (h.content && (h.role === "user" || h.role === "assistant")) {
          contents.push({
            role: h.role === "assistant" ? "model" : "user",
            parts: [{ text: h.content }],
          });
        }
      }
    }

    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const result = await model.generateContent({ contents });

    const response = result.response.text();

    return NextResponse.json({ response });
  } catch (err: unknown) {
    console.error("AI chat error:", err);
    const message = err instanceof Error ? err.message : "حدث خطأ في المعالجة";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
