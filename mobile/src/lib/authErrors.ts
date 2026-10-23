// Ported verbatim from the website (app/auth/page.tsx)
export function getFriendlyAuthErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return "حدث خطأ غير متوقع، يرجى المحاولة لاحقاً.";
  const msg = err.message || "";
  const lower = msg.toLowerCase();

  // Supabase Email / API Rate Limiting
  if (
    lower.includes("rate limit") ||
    lower.includes("rate_limit") ||
    lower.includes("too many requests") ||
    lower.includes("over_email_send_rate_limit")
  ) {
    return "تم تجاوز الحد المسموح لإرسال الرسائل من مزود الخدمة (Supabase Rate Limit). إذا لم تصلك رسالة التفعيل، يرجى الانتظار بضع دقائق، أو استخدام «المتابعة مع Google» للدخول الفوري.";
  }
  if (lower.includes("for security purposes") || lower.includes("once every")) {
    return "لدواعي الأمان، يسمح بطلب واحد كل 60 ثانية. يرجى الانتظار دقيقة ثم إعادة المحاولة.";
  }

  // Invalid login credentials
  if (lower.includes("invalid login credentials")) {
    return "بيانات الدخول غير صحيحة. إذا كنت قد سجلت عبر Google سابقاً، يرجى استخدام زر Google. أو تأكد من تفعيل الحساب من رابط البريد أولاً.";
  }

  // Email not confirmed
  if (lower.includes("email not confirmed")) {
    return "لم يتم تفعيل هذا الحساب بعد. يرجى مراجعة بريدك الإلكتروني (بما في ذلك مجلد الرسائل غير المرغوب فيها Spam) والضغط على رابط التفعيل.";
  }

  // User already registered
  if (lower.includes("user already registered") || lower.includes("already registered")) {
    return "هذا البريد الإلكتروني مسجل بالفعل. يرجى التبديل إلى «تسجيل الدخول» أو المتابعة مع Google.";
  }

  // Weak password
  if (lower.includes("password should be at least") || lower.includes("password is too short")) {
    return "كلمة المرور قصيرة جداً؛ يجب أن تتكون من 6 أحرف أو أرقام على الأقل.";
  }

  // Network / Brave Shields / fetch failure
  if (lower.includes("failed to fetch")) {
    return "تعذر الاتصال بخوادم المصادقة. يرجى التأكد من اتصال الإنترنت أو إيقاف مانع الإعلانات (Brave Shields).";
  }

  // Email format invalid
  if (lower.includes("invalid email") || lower.includes("unable to validate email address")) {
    return "صيغة البريد الإلكتروني غير صالحة. يرجى التحقق من كتابته بشكل صحيح.";
  }

  return msg || "حدث خطأ أثناء المصادقة.";
}
