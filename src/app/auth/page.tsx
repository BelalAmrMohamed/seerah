"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setUser = useAppStore((s) => s.setUser);

  // Check if already logged in
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace("/");
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        if (data.user) {
          setUser({ id: data.user.id, email: data.user.email!, name });
          toast.success("تم إنشاء الحساب بنجاح");
          router.push("/");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.full_name,
          });
          toast.success("تم تسجيل الدخول بنجاح");
          router.push("/");
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "حدث خطأ";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="grid min-h-[100svh] lg:grid-cols-2" data-era="dawn">
      {/* Left: decorative panel */}
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0" style={{ background: "var(--wash)" }} />
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 30% 40%, color-mix(in srgb, var(--era) 25%, transparent), transparent 70%)",
        }} />

        {/* Geometric pattern */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.06]" aria-hidden>
          <defs>
            <pattern id="geo-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <polygon points="40,5 51,30 75,30 56,47 64,72 40,57 16,72 24,47 5,30 29,30" fill="none" stroke="var(--era)" strokeWidth="0.5" />
              <circle cx="40" cy="40" r="25" fill="none" stroke="var(--era)" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#geo-pattern)" />
        </svg>

        <div className="relative z-10 grid h-full place-items-center p-12">
          <div className="grid gap-6 text-center">
            <h1 className="font-display text-6xl leading-[1.6]" style={{ color: "var(--era)" }}>رحلة في السيرة</h1>
            <p className="mx-auto max-w-[24ch] text-xl leading-[2]" style={{ color: "var(--muted)" }}>
              ثلاثون محطة من السيرة النبوية لابن هشام، من عام الفيل إلى الرفيق الأعلى
            </p>
            <div className="mx-auto h-px w-32" style={{ background: "var(--era)" }} />
          </div>
        </div>
      </div>

      {/* Right: auth form */}
      <div className="grid place-items-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-10 text-center lg:hidden">
            <h1 className="font-display text-4xl" style={{ color: "var(--accent)" }}>رحلة في السيرة</h1>
          </div>

          <div className="glass-card grid gap-8">
            {/* Mode toggle */}
            <div className="flex gap-1 rounded-xl p-1" style={{ background: "var(--bg)" }}>
              <button
                className="flex-1 rounded-lg py-2.5 text-center font-ui text-sm font-medium transition-all"
                style={{
                  background: mode === "login" ? "var(--solid)" : "transparent",
                  color: mode === "login" ? "var(--ink)" : "var(--muted)",
                  boxShadow: mode === "login" ? "var(--shadow)" : "none",
                }}
                onClick={() => setMode("login")}
              >
                تسجيل الدخول
              </button>
              <button
                className="flex-1 rounded-lg py-2.5 text-center font-ui text-sm font-medium transition-all"
                style={{
                  background: mode === "signup" ? "var(--solid)" : "transparent",
                  color: mode === "signup" ? "var(--ink)" : "var(--muted)",
                  boxShadow: mode === "signup" ? "var(--shadow)" : "none",
                }}
                onClick={() => setMode("signup")}
              >
                حساب جديد
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-5">
              {mode === "signup" && (
                <div className="grid gap-2">
                  <label htmlFor="name" className="label">الاسم</label>
                  <input
                    id="name" type="text" className="input" placeholder="اسمك الكريم"
                    value={name} onChange={(e) => setName(e.target.value)}
                    required={mode === "signup"}
                  />
                </div>
              )}
              <div className="grid gap-2">
                <label htmlFor="email" className="label">البريد الإلكتروني</label>
                <input
                  id="email" type="email" className="input" placeholder="your@email.com" dir="ltr"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  required autoComplete="email"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="password" className="label">كلمة المرور</label>
                <input
                  id="password" type="password" className="input" placeholder="••••••••" dir="ltr"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  required minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </div>
              <button type="submit" className="btn-primary mt-2 w-full py-3" disabled={loading}>
                {loading ? (
                  <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="h-px flex-1" style={{ background: "var(--line)" }} />
              <span className="label">أو</span>
              <div className="h-px flex-1" style={{ background: "var(--line)" }} />
            </div>

            {/* Google OAuth */}
            <button onClick={handleGoogleLogin} className="ghost w-full justify-center gap-3 py-3">
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>المتابعة مع Google</span>
            </button>

            {/* Guest mode */}
            <div className="text-center">
              <button
                onClick={() => router.push("/")}
                className="text-sm underline underline-offset-4 transition-colors hover:text-[color:var(--accent)]"
                style={{ color: "var(--muted)" }}
              >
                تصفح كزائر بدون حساب
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
