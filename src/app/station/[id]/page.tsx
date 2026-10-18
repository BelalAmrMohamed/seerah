import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ar, arYear, cite, eraOf, sentences, stations } from "@/lib/stations";
import { BookOpen, MapPin, Calendar, Clock, ChevronRight, ChevronLeft, ExternalLink, Quote, Users, Lightbulb } from "lucide-react";

export const dynamicParams = false;
export const generateStaticParams = () => stations.map((s) => ({ id: String(s.id) }));
const find = (id: string) => stations.find((s) => String(s.id) === id);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const s = find((await params).id);
  return s ? { title: `${s.title} — رحلة في السيرة`, description: s.description } : {};
}

export default async function StationPage({ params }: { params: Promise<{ id: string }> }) {
  const s = find((await params).id);
  if (!s) notFound();

  const era = eraOf(s.category);
  const prev = stations.find((x) => x.id === s.id - 1);
  const next = stations.find((x) => x.id === s.id + 1);
  const paras = (() => {
    const sn = sentences(s.bookContent);
    const out: string[] = [];
    for (let i = 0; i < sn.length; i += 3) out.push(sn.slice(i, i + 3).join(" "));
    return out;
  })();

  return (
    <div data-era={era} className="min-h-[100svh] pb-20">
      {/* Hero banner */}
      <div className="relative overflow-hidden pb-12 pt-24 md:pb-16 md:pt-32">
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, var(--wash), transparent)" }} />
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 50% 20%, color-mix(in srgb, var(--era) 15%, transparent), transparent 70%)",
        }} />

        <div className="wrap relative z-10 grid gap-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 font-ui text-sm" style={{ color: "var(--muted)" }} aria-label="التنقل">
            <Link href="/" className="transition-colors hover:text-[color:var(--era)]">الرحلة</Link>
            <ChevronLeft size={14} />
            <span style={{ color: "var(--era)" }}>المحطة {ar(s.id)}</span>
          </nav>

          {/* Station info */}
          <div className="flex items-end gap-6">
            <span className="num !text-[clamp(5rem,16vw,12rem)]" aria-hidden>{ar(s.id)}</span>
            <div className="grid gap-1 pb-3">
              <div className="flex items-center gap-2" style={{ color: "var(--era)" }}>
                <Calendar size={16} />
                <span className="font-ui text-lg">{arYear(s.year)}</span>
                <span className="font-ui text-sm" style={{ color: "var(--muted)" }}>({ar(s.hijriYear)})</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: "var(--muted)" }}>
                <MapPin size={16} />
                <span className="font-ui text-sm">{s.location}</span>
              </div>
            </div>
          </div>

          <h1 className="title">{s.title}</h1>
          <p className="sub">{s.subtitle}</p>

          {/* Category chip */}
          <div className="flex items-center gap-3">
            <span className="chip">{s.category}</span>
            <Link href={`/#s-${s.id}`} className="btn text-sm">
              شاهد في الرحلة
            </Link>
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="wrap grid gap-12 lg:grid-cols-[1fr,20rem] lg:gap-16">
        {/* Main content */}
        <div className="grid gap-12">
          {/* Description */}
          <section className="grid gap-4">
            <h2 className="flex items-center gap-2 font-display text-2xl leading-[1.7]" style={{ color: "var(--era)" }}>
              <BookOpen size={22} />
              الوصف
            </h2>
            <p className="body-text">{s.description}</p>
          </section>

          {/* Book text */}
          <section className="grid gap-4">
            <h2 className="flex items-center gap-2 font-display text-2xl leading-[1.7]" style={{ color: "var(--era)" }}>
              <BookOpen size={22} />
              نص ابن هشام
            </h2>
            <div className="glass-card grid gap-5" style={{ fontSize: "1.35rem", lineHeight: 2.2 }}>
              {paras.map((p, i) => <p key={i}>{p}</p>)}
            </div>
            <a
              className="btn w-fit gap-2 text-sm"
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={14} />
              {cite(s)}
            </a>
          </section>

          {/* Quote */}
          <section className="grid gap-4">
            <h2 className="flex items-center gap-2 font-display text-2xl leading-[1.7]" style={{ color: "var(--era)" }}>
              <Quote size={22} />
              اقتباس بارز
            </h2>
            <blockquote className="border-s-4 ps-6" style={{ borderColor: "var(--era)", fontSize: "clamp(1.4rem,2.6vw,2rem)", lineHeight: 2, maxWidth: "34ch" }}>
              «{s.quote}»
            </blockquote>
          </section>

          {/* Significance */}
          <section className="grid gap-4">
            <h2 className="flex items-center gap-2 font-display text-2xl leading-[1.7]" style={{ color: "var(--era)" }}>
              <Lightbulb size={22} />
              الدلالة والأهمية
            </h2>
            <p className="body-text">{s.significance}</p>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="grid content-start gap-6">
          {/* Key figures */}
          <div className="glass-card grid gap-4">
            <h3 className="flex items-center gap-2 font-display text-xl leading-[1.7]" style={{ color: "var(--era)" }}>
              <Users size={18} />
              شخصيات المحطة
            </h3>
            <ul className="grid gap-2">
              {s.keyFigures.map((f) => (
                <li key={f} className="flex items-center gap-2.5 rounded-lg px-3 py-2" style={{
                  background: "color-mix(in srgb, var(--era) 8%, transparent)",
                }}>
                  <div className="h-2 w-2 rounded-full" style={{ background: "var(--era)" }} />
                  <span className="font-display text-lg leading-[1.7]">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Timeline position */}
          <div className="glass-card grid gap-3">
            <h3 className="label">موقع المحطة في الرحلة</h3>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 30 }, (_, i) => (
                <div
                  key={i}
                  className="h-2 flex-1 rounded-full transition-colors"
                  style={{
                    background: i + 1 === s.id ? "var(--era)" : i + 1 < s.id ? "color-mix(in srgb, var(--era) 30%, transparent)" : "var(--line)",
                    boxShadow: i + 1 === s.id ? `0 0 8px var(--era)` : "none",
                  }}
                />
              ))}
            </div>
            <p className="label text-center">{ar(s.id)} من {ar(30)}</p>
          </div>

          {/* Quick details */}
          <div className="glass-card grid gap-3">
            <h3 className="label">معلومات سريعة</h3>
            <div className="grid gap-2 font-ui text-sm">
              <div className="flex justify-between">
                <span style={{ color: "var(--muted)" }}>التاريخ الميلادي</span>
                <span>{arYear(s.year)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--muted)" }}>التاريخ الهجري</span>
                <span>{ar(s.hijriYear)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--muted)" }}>الجزء</span>
                <span>{ar(s.volume)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--muted)" }}>الصفحة</span>
                <span>{ar(s.page)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Navigation */}
      <div className="wrap mt-16">
        <div className="flex items-stretch gap-4">
          {prev ? (
            <Link href={`/station/${prev.id}`} data-era={eraOf(prev.category)} className="glass-card group flex flex-1 items-center gap-4 transition-all hover:!border-[color:var(--era)]">
              <ChevronRight size={20} style={{ color: "var(--era)" }} />
              <div>
                <p className="label">المحطة السابقة</p>
                <p className="font-display text-lg leading-[1.7] transition-colors group-hover:text-[color:var(--era)]">{prev.title}</p>
              </div>
            </Link>
          ) : <div className="flex-1" />}
          {next ? (
            <Link href={`/station/${next.id}`} data-era={eraOf(next.category)} className="glass-card group flex flex-1 items-center justify-end gap-4 text-end transition-all hover:!border-[color:var(--era)]">
              <div>
                <p className="label">المحطة التالية</p>
                <p className="font-display text-lg leading-[1.7] transition-colors group-hover:text-[color:var(--era)]">{next.title}</p>
              </div>
              <ChevronLeft size={20} style={{ color: "var(--era)" }} />
            </Link>
          ) : <div className="flex-1" />}
        </div>
      </div>
    </div>
  );
}
