import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ar, arYear, cite, eraOf, sentences, stations } from "@/lib/stations";

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
  return (
    <article data-era={eraOf(s.category)} className="wrap grid gap-10 py-28 md:py-36">
      <Link href={`/#s-${s.id}`} className="btn w-fit">العودة إلى الرحلة</Link>
      <div style={{ color: "var(--era)" }}>{ar(s.id)} · {arYear(s.year)} · {ar(s.hijriYear)}</div>
      <h1 className="title">{s.title}</h1>
      <p className="sub">{s.subtitle}</p>
      <p className="meta">{s.location}</p>
      <p className="body-text">{s.description}</p>
      <blockquote className="font-text max-w-[34ch] text-3xl" style={{ lineHeight: 2 }}>«{s.quote}»</blockquote>
      <div className="grid max-w-[40ch] gap-5" style={{ fontSize: "1.5rem", lineHeight: 2.2 }}>{sentences(s.bookContent).map((t, i) => <p key={i}>{t}</p>)}</div>
      <ul className="flex flex-wrap gap-2">{s.keyFigures.map((f) => <li key={f} className="chip">{f}</li>)}</ul>
      <p className="max-w-[44ch] border-s-2 ps-5" style={{ borderColor: "var(--era)", color: "var(--muted)", lineHeight: 2 }}>الدلالة: {s.significance}</p>
      <a className="underline underline-offset-4" style={{ color: "var(--muted)" }} href={s.url} target="_blank" rel="noopener noreferrer">{cite(s)}</a>
    </article>
  );
}
