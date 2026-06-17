import { getAllArticles } from "@/lib/articles";
import { MedCard, CATS } from "@/components/ArticleCard";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 600;

const BASE = "https://gelecekfinans.com";
const PER_PAGE = 24;

const MONTHS_TR = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

type SP = { q?: string; kategori?: string; sayfa?: string };

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }): Promise<Metadata> {
  const { q, kategori, sayfa } = await searchParams;
  const page = Math.max(1, parseInt(sayfa || "1"));
  const catCfg = kategori ? CATS[kategori] : undefined;

  let title = "Haber Arşivi";
  if (catCfg) title = `${catCfg.l} Arşivi`;
  if (q) title = `"${q}" Arama Sonuçları`;
  if (page > 1) title += ` — Sayfa ${page}`;

  // Arama/filtre sonuçları thin/duplicate olabilir → canonical her zaman temel arşive,
  // q veya derin sayfalama varsa noindex.
  const canonical = `${BASE}/arsiv`;
  const shouldIndex = !q && page === 1;

  return {
    title,
    description: "GelecekFinans haber arşivi — tarih ve kategoriye göre tüm finans, borsa, kripto, döviz, altın ve ekonomi haberleri.",
    alternates: { canonical: catCfg ? `${BASE}/arsiv?kategori=${kategori}` : canonical },
    robots: { index: shouldIndex, follow: true },
  };
}

function norm(s: string): string {
  return s
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i").replace(/İ/g, "i")
    .replace(/ş/g, "s").replace(/ğ/g, "g")
    .replace(/ü/g, "u").replace(/ö/g, "o").replace(/ç/g, "c");
}

export default async function ArchivePage({ searchParams }: { searchParams: Promise<SP> }) {
  const { q, kategori, sayfa } = await searchParams;
  const page = Math.max(1, parseInt(sayfa || "1"));
  const query = (q || "").trim();
  const activeCat = kategori && CATS[kategori] ? kategori : "";

  let all = await getAllArticles(500);

  if (activeCat) all = all.filter((a) => a.category === activeCat);

  if (query) {
    const nq = norm(query);
    all = all.filter(
      (a) => norm(a.title).includes(nq) || norm(a.meta).includes(nq) || norm(a.keyword || "").includes(nq),
    );
  }

  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const current = Math.min(page, totalPages);
  const pageArts = all.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  // Tarihe göre grupla (Yıl Ay) — sadece arama yokken kronolojik blok göster.
  const groups: { label: string; items: typeof pageArts }[] = [];
  if (!query) {
    const map = new Map<string, typeof pageArts>();
    for (const a of pageArts) {
      const d = new Date(a.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    for (const [key, items] of map) {
      const [y, m] = key.split("-").map(Number);
      groups.push({ label: `${MONTHS_TR[m]} ${y}`, items });
    }
  }

  function buildHref(overrides: Partial<SP>) {
    const params = new URLSearchParams();
    const qVal = overrides.q !== undefined ? overrides.q : query;
    const catVal = overrides.kategori !== undefined ? overrides.kategori : activeCat;
    const pVal = overrides.sayfa !== undefined ? overrides.sayfa : "";
    if (qVal) params.set("q", qVal);
    if (catVal) params.set("kategori", catVal);
    if (pVal && pVal !== "1") params.set("sayfa", pVal);
    const s = params.toString();
    return `/arsiv${s ? `?${s}` : ""}`;
  }

  return (
    <div className="container page-cat">
      <div className="cat-header">
        <span className="tag" style={{ marginBottom: 10, display: "inline-block" }}>ARŞİV</span>
        <h1 className="page-header">Haber Arşivi</h1>
        <p className="cat-count">{total} haber{activeCat ? ` · ${CATS[activeCat].l}` : ""}{query ? ` · "${query}"` : ""}</p>
      </div>

      {/* Arama */}
      <form action="/arsiv" method="get" style={{ display: "flex", gap: 8, margin: "20px 0", flexWrap: "wrap" }}>
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Arşivde ara..."
          aria-label="Arşivde ara"
          style={{ flex: "1 1 240px", minWidth: 0, padding: "10px 14px", border: "1px solid var(--border, #ddd)", borderRadius: 8, fontSize: 14, background: "var(--surface, #fff)", color: "inherit" }}
        />
        {activeCat && <input type="hidden" name="kategori" value={activeCat} />}
        <button type="submit" className="page-btn" style={{ cursor: "pointer" }}>Ara</button>
      </form>

      {/* Kategori filtreleri */}
      <nav style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }} aria-label="Kategori filtreleri">
        <Link href={buildHref({ kategori: "", sayfa: "1" })} className={`page-btn${!activeCat ? " active" : ""}`}>Tümü</Link>
        {Object.entries(CATS).map(([key, c]) => (
          <Link key={key} href={buildHref({ kategori: key, sayfa: "1" })} className={`page-btn${activeCat === key ? " active" : ""}`}>
            {c.l}
          </Link>
        ))}
      </nav>

      {!pageArts.length && (
        <p className="cat-empty">
          {query ? `"${query}" için sonuç bulunamadı.` : "Bu arşivde henüz haber yok."}
        </p>
      )}

      {/* Arama varsa düz grid, yoksa tarihe göre gruplu */}
      {query || groups.length === 0 ? (
        <div className="resp-grid-4">
          {pageArts.map((a) => <MedCard key={a.filename} article={a} />)}
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.label} style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--muted, #888)", marginBottom: 14, borderBottom: "1px solid var(--border, #eee)", paddingBottom: 8 }}>
              {g.label}
            </h2>
            <div className="resp-grid-4">
              {g.items.map((a) => <MedCard key={a.filename} article={a} />)}
            </div>
          </section>
        ))
      )}

      {/* Sayfalama */}
      {totalPages > 1 && (
        <nav className="pagination" aria-label="Sayfalama">
          {current > 1 && (
            <Link href={buildHref({ sayfa: String(current - 1) })} className="page-btn">← Önceki</Link>
          )}
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={buildHref({ sayfa: String(p) })} className={`page-btn${p === current ? " active" : ""}`}>
              {p}
            </Link>
          ))}
          {current < totalPages && (
            <Link href={buildHref({ sayfa: String(current + 1) })} className="page-btn">Sonraki →</Link>
          )}
        </nav>
      )}
    </div>
  );
}
