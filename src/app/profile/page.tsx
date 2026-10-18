"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/lib/store";
import { ar, arYear, eraOf, stations } from "@/lib/stations";
import { toast } from "sonner";
import { BookOpen, Bookmark, LogOut, Star, CheckCircle2, Circle } from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type Progress = Database["public"]["Tables"]["reading_progress"]["Row"];

export default function ProfilePage() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      if (!u) {
        router.replace("/auth");
        return;
      }
      setUser({ id: u.id, email: u.email!, name: u.user_metadata?.full_name });

      const { data } = await supabase
        .from("reading_progress")
        .select("*")
        .eq("user_id", u.id)
        .order("station_id");
      if (data) setProgress(data);
      setLoading(false);
    });
  }, [router, setUser]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    toast.success("تم تسجيل الخروج");
    router.push("/");
  };

  const completedCount = progress.filter((p) => p.completed).length;
  const bookmarkedCount = progress.filter((p) => p.bookmarked).length;
  const progressMap = new Map(progress.map((p) => [p.station_id, p]));

  if (loading) {
    return (
      <div className="grid min-h-[100svh] place-items-center" data-era="dawn">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-current border-t-transparent" style={{ color: "var(--accent)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] pb-20 pt-24 md:pt-32" data-era="dawn">
      <div className="wrap">
        {/* Profile header */}
        <div className="mb-12 flex flex-wrap items-start justify-between gap-6">
          <div className="grid gap-3">
            <h1 className="font-display text-4xl leading-[1.6] md:text-5xl">
              أهلاً{user?.name ? ` ${user.name}` : ""}
            </h1>
            <p className="label">{user?.email}</p>
          </div>
          <button onClick={handleSignOut} className="ghost gap-2">
            <LogOut size={16} />
            تسجيل الخروج
          </button>
        </div>

        {/* Stats cards */}
        <div className="mb-12 grid gap-4 sm:grid-cols-3">
          <div className="glass-card grid gap-2 text-center">
            <BookOpen size={24} className="mx-auto" style={{ color: "var(--accent)" }} />
            <span className="font-display text-3xl" style={{ color: "var(--accent)" }}>{ar(completedCount)}</span>
            <span className="label">محطة مكتملة</span>
          </div>
          <div className="glass-card grid gap-2 text-center">
            <Bookmark size={24} className="mx-auto" style={{ color: "var(--accent)" }} />
            <span className="font-display text-3xl" style={{ color: "var(--accent)" }}>{ar(bookmarkedCount)}</span>
            <span className="label">إشارة مرجعية</span>
          </div>
          <div className="glass-card grid gap-2 text-center">
            <Star size={24} className="mx-auto" style={{ color: "var(--accent)" }} />
            <span className="font-display text-3xl" style={{ color: "var(--accent)" }}>
              {ar(Math.round((completedCount / 30) * 100))}٪
            </span>
            <span className="label">نسبة الإكمال</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <span className="label">تقدم الرحلة</span>
            <span className="label">{ar(completedCount)} / {ar(30)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--line)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(completedCount / 30) * 100}%`,
                background: "var(--era-grad, var(--accent))",
              }}
            />
          </div>
        </div>

        {/* Station progress list */}
        <h2 className="mb-6 font-display text-2xl leading-[1.7]">المحطات</h2>
        <div className="grid gap-3">
          {stations.map((s) => {
            const p = progressMap.get(s.id);
            const era = eraOf(s.category);
            return (
              <Link
                key={s.id}
                href={`/station/${s.id}`}
                data-era={era}
                className="glass-card group flex items-center gap-4 !py-4 transition-all hover:!border-[color:var(--era)]"
              >
                {p?.completed ? (
                  <CheckCircle2 size={22} style={{ color: "var(--era)" }} />
                ) : (
                  <Circle size={22} style={{ color: "var(--line)" }} />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg" style={{ color: "var(--era)" }}>{ar(s.id)}</span>
                    <span className="font-display text-lg leading-[1.7] transition-colors group-hover:text-[color:var(--era)]">
                      {s.title}
                    </span>
                  </div>
                </div>
                <span className="label hidden sm:block">{arYear(s.year)}</span>
                {p?.bookmarked && <Bookmark size={16} fill="var(--era)" style={{ color: "var(--era)" }} />}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
