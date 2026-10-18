"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { stations, ar, arYear, eraOf, eraNames, type Era } from "@/lib/stations";
import { Search, Filter, BookOpen, MapPin, Calendar, Users, ArrowUpDown, LayoutGrid, List, Sparkles, ExternalLink, X } from "lucide-react";

type SortOption = "chrono-asc" | "chrono-desc" | "title";
type ViewMode = "grid" | "timeline";

const ERAS: { key: Era | "all"; label: string; count: number }[] = [
  { key: "all", label: "جميع المحطات", count: 30 },
  { key: "dawn", label: "فجر الرسالة", count: 7 },
  { key: "night", label: "العهد المكي", count: 9 },
  { key: "hijra", label: "طريق الهجرة", count: 1 },
  { key: "madina", label: "العهد المدني", count: 7 },
  { key: "victory", label: "الفتح والتمكين", count: 4 },
  { key: "farewell", label: "حجة الوداع", count: 2 },
];

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [selectedEra, setSelectedEra] = useState<Era | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("chrono-asc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const filtered = useMemo(() => {
    let list = stations.filter((s) => {
      const era = eraOf(s.category);
      if (selectedEra !== "all" && era !== selectedEra) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return (
          s.title.toLowerCase().includes(q) ||
          s.subtitle.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.quote.toLowerCase().includes(q) ||
          s.year.includes(q) ||
          s.keyFigures.some((f) => f.toLowerCase().includes(q))
        );
      }
      return true;
    });

    // Sorting
    list = [...list].sort((a, b) => {
      if (sortBy === "chrono-asc") return a.id - b.id;
      if (sortBy === "chrono-desc") return b.id - a.id;
      if (sortBy === "title") return a.title.localeCompare(b.title, "ar");
      return 0;
    });

    return list;
  }, [search, selectedEra, sortBy]);

  return (
    <div className="min-h-[100svh] pb-24 pt-24 md:pt-32" data-era="dawn">
      <div className="wrap max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Hero */}
        <div className="mb-10 text-center md:text-start">
          <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs border border-[color:var(--line)] bg-[color:var(--panel)] mb-4">
            <Sparkles size={14} style={{ color: "var(--accent)" }} />
            <span className="font-ui text-[color:var(--muted)]">فهرس السيرة النبوية الشامل</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl leading-tight md:leading-normal" style={{ color: "var(--accent)" }}>
            استكشف محطات السيرة
          </h1>
          <p className="sub mt-2 text-base md:text-lg">
            تصفح المحطات الثلاثين بحرية، وابحث في أحداث وشخصيات وأماكن سيرة النبي محمد ﷺ
          </p>

          {/* Quick Stats Banner */}
          <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-ui text-[color:var(--muted)]">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              ٣٠ محطة تاريخية
            </span>
            <span>·</span>
            <span>٦ حِقَب كبرى</span>
            <span>·</span>
            <span>من عام الفيل ٥٧١ م حتى حجة الوداع ووفاته ﷺ ١١ هـ</span>
          </div>
        </div>

        {/* Search, Filter & View Controls */}
        <div className="mb-8 grid gap-4 rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)] p-4 sm:p-5 backdrop-blur-xl">
          {/* Search bar & View switcher */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2" size={18} style={{ color: "var(--muted)" }} />
              <input
                type="search"
                className="input w-full pr-11 pl-10 py-2.5 rounded-xl text-sm"
                placeholder="ابحث عن محطة، شخصية، حدث، أو مكان (مثل: غار حراء، بدر، الطائف)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)] hover:text-[color:var(--ink)]"
                  aria-label="مسح البحث"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3">
              {/* Sort selector */}
              <div className="flex items-center gap-2">
                <ArrowUpDown size={15} style={{ color: "var(--muted)" }} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="rounded-xl border border-[color:var(--line)] bg-[color:var(--solid)] px-3 py-2 text-xs font-ui text-[color:var(--ink)] outline-none cursor-pointer"
                >
                  <option value="chrono-asc">ترتيب زمني (١ ← ٣٠)</option>
                  <option value="chrono-desc">ترتيب عكسي (٣٠ ← ١)</option>
                  <option value="title">أبجدياً (أ ← ي)</option>
                </select>
              </div>

              {/* View mode toggle */}
              <div className="flex items-center rounded-xl border border-[color:var(--line)] bg-[color:var(--solid)] p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className="rounded-lg p-1.5 transition-all"
                  style={{
                    background: viewMode === "grid" ? "color-mix(in srgb, var(--accent) 18%, transparent)" : "transparent",
                    color: viewMode === "grid" ? "var(--accent)" : "var(--muted)",
                  }}
                  title="عرض الشبكة"
                  aria-label="عرض الشبكة"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode("timeline")}
                  className="rounded-lg p-1.5 transition-all"
                  style={{
                    background: viewMode === "timeline" ? "color-mix(in srgb, var(--accent) 18%, transparent)" : "transparent",
                    color: viewMode === "timeline" ? "var(--accent)" : "var(--muted)",
                  }}
                  title="عرض الجدول الزمني"
                  aria-label="عرض الجدول الزمني"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Era Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[color:var(--line)]">
            <span className="flex items-center gap-1.5 text-xs text-[color:var(--muted)] font-ui me-1">
              <Filter size={14} />
              الحِقبة:
            </span>
            {ERAS.map((era) => {
              const active = selectedEra === era.key;
              return (
                <button
                  key={era.key}
                  onClick={() => setSelectedEra(era.key)}
                  data-era={era.key !== "all" ? era.key : undefined}
                  className="chip !text-xs font-ui flex items-center gap-1.5 transition-all"
                  style={{
                    background: active
                      ? "color-mix(in srgb, var(--era, var(--accent)) 25%, transparent)"
                      : undefined,
                    borderColor: active ? "var(--era, var(--accent))" : undefined,
                    color: active ? "var(--era, var(--accent))" : undefined,
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {era.key !== "all" && (
                    <span
                      className="h-1.5 w-1.5 rounded-full shrink-0"
                      style={{ background: "var(--era, var(--accent))" }}
                    />
                  )}
                  <span>{era.label}</span>
                  <span className="text-[10px] opacity-70">({ar(era.count)})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Info Bar */}
        <div className="mb-6 flex items-center justify-between font-ui text-xs text-[color:var(--muted)]">
          <p>
            عرض <span className="font-bold text-[color:var(--ink)]">{ar(filtered.length)}</span> من أصل{" "}
            <span className="font-bold text-[color:var(--ink)]">{ar(30)}</span> محطة
            {selectedEra !== "all" && <span> في حقبة «{ERAS.find((e) => e.key === selectedEra)?.label}»</span>}
            {search && <span> مطابقة لـ «{search}»</span>}
          </p>
          {(selectedEra !== "all" || search) && (
            <button
              onClick={() => {
                setSelectedEra("all");
                setSearch("");
              }}
              className="text-[color:var(--accent)] hover:underline"
            >
              إعادة ضبط الفلاتر
            </button>
          )}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)] p-12 text-center">
            <p className="font-display text-2xl text-[color:var(--ink)] mb-2">لا توجد محطات مطابقة للبحث</p>
            <p className="text-sm text-[color:var(--muted)] mb-6">
              جرّب استخدام كلمات بحث أخرى أو إزالة فلاتر الحِقَب
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedEra("all");
              }}
              className="btn font-ui"
            >
              عرض جميع المحطات
            </button>
          </div>
        )}

        {/* ─────────────── GRID VIEW ─────────────── */}
        {viewMode === "grid" && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((s) => {
              const era = eraOf(s.category);
              return (
                <div
                  key={s.id}
                  data-era={era}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[color:var(--glass-border)] bg-[color:var(--glass)] p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-[color:var(--era)] hover:shadow-2xl"
                >
                  {/* Era accent gradient stripe */}
                  <div
                    className="absolute inset-x-0 top-0 h-1 opacity-70 transition-opacity group-hover:opacity-100"
                    style={{ background: "var(--era-grad, var(--era))" }}
                  />

                  {/* Top section: Badge, Year & Era */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      {/* Station number & Era tag */}
                      <div className="flex items-center gap-2">
                        <span
                          className="flex h-9 w-9 items-center justify-center rounded-xl font-display text-lg font-bold"
                          style={{
                            background: "color-mix(in srgb, var(--era) 16%, transparent)",
                            color: "var(--era)",
                            border: "1px solid color-mix(in srgb, var(--era) 30%, transparent)",
                          }}
                        >
                          {ar(s.id)}
                        </span>
                        <span
                          className="rounded-lg px-2.5 py-1 text-xs font-ui font-medium"
                          style={{
                            background: "color-mix(in srgb, var(--era) 10%, transparent)",
                            color: "var(--era)",
                          }}
                        >
                          {eraNames[era]}
                        </span>
                      </div>

                      {/* Year pill with isolate to prevent Bidi flip */}
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs border border-[color:var(--line)] bg-[color:var(--panel)] shrink-0 font-ui text-[color:var(--muted)]">
                        <Calendar size={12} className="text-[color:var(--era)] shrink-0" />
                        <bdi dir="rtl">{arYear(s.year)}</bdi>
                      </span>
                    </div>

                    {/* Station Title */}
                    <Link href={`/station/${s.id}`} className="block group-hover:text-[color:var(--era)] transition-colors">
                      <h2 className="font-display text-xl font-bold leading-snug line-clamp-2 mb-2">
                        {s.title}
                      </h2>
                    </Link>

                    {/* Subtitle */}
                    <p className="text-sm leading-relaxed text-[color:var(--muted)] line-clamp-2 mb-4 font-ui">
                      {s.subtitle}
                    </p>

                    {/* Quote preview */}
                    {s.quote && (
                      <div className="mb-4 rounded-xl border border-[color:var(--line)] bg-[color:var(--solid)] p-3 text-xs leading-relaxed text-[color:var(--ink)] opacity-90 line-clamp-2">
                        <span className="text-[color:var(--era)] font-serif text-sm">« </span>
                        <span>{s.quote}</span>
                        <span className="text-[color:var(--era)] font-serif text-sm"> »</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom section: Metadata & CTAs */}
                  <div className="pt-4 border-t border-[color:var(--line)] grid gap-3">
                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-xs text-[color:var(--muted)] font-ui truncate">
                      <MapPin size={13} className="shrink-0 text-[color:var(--era)]" />
                      <span className="truncate">{s.location}</span>
                    </div>

                    {/* Key figures */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Users size={12} className="text-[color:var(--muted)] shrink-0" />
                      {s.keyFigures.slice(0, 3).map((f) => (
                        <span
                          key={f}
                          className="rounded-md px-2 py-0.5 text-[11px] font-ui"
                          style={{
                            background: "color-mix(in srgb, var(--era) 10%, transparent)",
                            color: "var(--ink)",
                          }}
                        >
                          {f}
                        </span>
                      ))}
                      {s.keyFigures.length > 3 && (
                        <span className="text-[10px] text-[color:var(--muted)] font-ui">
                          +{ar(s.keyFigures.length - 3)}
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="mt-2 flex items-center justify-between gap-2 pt-2">
                      <Link
                        href={`/#s-${s.id}`}
                        className="btn !py-1.5 !px-3 !text-xs font-ui flex-1 justify-center gap-1.5"
                        title="اقرأ المحطة في الرحلة التفاعلية ثلاثية الأبعاد"
                      >
                        <BookOpen size={13} />
                        <span>في الرحلة</span>
                      </Link>

                      <Link
                        href={`/station/${s.id}`}
                        className="btn-primary !py-1.5 !px-3 !text-xs font-ui flex-1 justify-center gap-1.5"
                        title="عرض النص الكامل من ابن هشام والشخصيات"
                      >
                        <span>التفاصيل</span>
                        <ExternalLink size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─────────────── TIMELINE VIEW ─────────────── */}
        {viewMode === "timeline" && filtered.length > 0 && (
          <div className="relative grid gap-4 border-s-2 border-[color:var(--line)] ps-6 ms-4 sm:ms-8">
            {filtered.map((s) => {
              const era = eraOf(s.category);
              return (
                <div
                  key={s.id}
                  data-era={era}
                  className="group relative rounded-2xl border border-[color:var(--glass-border)] bg-[color:var(--glass)] p-5 shadow-sm backdrop-blur-xl transition-all hover:border-[color:var(--era)] hover:shadow-md"
                >
                  {/* Timeline node circle */}
                  <span
                    className="absolute -start-[35px] top-6 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold font-display"
                    style={{
                      background: "var(--solid)",
                      border: "2px solid var(--era)",
                      color: "var(--era)",
                    }}
                  >
                    {ar(s.id)}
                  </span>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="grid gap-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="rounded-md px-2 py-0.5 text-xs font-ui font-medium"
                          style={{
                            background: "color-mix(in srgb, var(--era) 12%, transparent)",
                            color: "var(--era)",
                          }}
                        >
                          {eraNames[era]}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-[color:var(--muted)] font-ui">
                          <Calendar size={12} />
                          <bdi dir="rtl">{arYear(s.year)}</bdi>
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-[color:var(--muted)] font-ui">
                          <MapPin size={12} />
                          <span>{s.location}</span>
                        </span>
                      </div>

                      <Link href={`/station/${s.id}`} className="hover:text-[color:var(--era)] transition-colors">
                        <h2 className="font-display text-xl font-bold mt-1">
                          {s.title}
                        </h2>
                      </Link>

                      <p className="text-sm text-[color:var(--muted)] font-ui line-clamp-1">
                        {s.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/#s-${s.id}`}
                        className="btn !py-1.5 !px-3 !text-xs font-ui"
                      >
                        <BookOpen size={13} />
                        الرحلة
                      </Link>
                      <Link
                        href={`/station/${s.id}`}
                        className="btn-primary !py-1.5 !px-3 !text-xs font-ui"
                      >
                        النص الكامل
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
