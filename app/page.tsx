import { getAllArticles } from "@/lib/articles";
import { HeroCard, StripCard, MedCard, RankedCard, CATS, Ago } from "@/components/ArticleCard";
import Newsletter from "@/components/Newsletter";
import MarketBoard from "@/components/MarketBoard";
import MoversRail from "@/components/MoversRail";
import AdSlot from "@/components/AdSlot";
import Link from "next/link";
export const dynamic = "force-dynamic";
export const revalidate = 300;

export default async function HomePage() {
  const all = await getAllArticles();
  if (!all.length) return (
    <div className="container empty-state">
      <p className="empty-title">Henüz makale yok</p>
      <p className="empty-desc">
        Admin panelinden makale ürettikten sonra burada görünecek.
      </p>
    </div>
  );

  const hero    = all[0];
  const lead2   = all.slice(1, 3);   // liderin yanındaki ikincil iki haber
  const strip   = all.slice(3, 6);   // lider altı üçlü şerit
  const mostRead = [...all]
    .map(a => ({ a, v: a.views ?? 0 }))
    .sort((x, y) => y.v - x.v)
    .slice(0, 5)
    .map(x => x.a);
  const ranked  = all.slice(6, 11);
  const recent  = all.slice(11, 23);
  const trending = Array.from(
    new Set(all.flatMap(a => (a.keyword ? a.keyword.split(/[,;]/) : [])).map(k => k.trim()).filter(Boolean))
  ).slice(0, 10);
  const byCat   = Object.keys(CATS).map(cat=>({
    cat, cfg: CATS[cat],
    items: all.filter(a=>a.category===cat).slice(0,4),
  })).filter(g=>g.items.length>=2);

  return (
    <div className="container page-home">

      {/* ── CANLI PİYASA TABLOSU (Doviz/Investing tarzı, sayfanın üstünde) ── */}
      <MarketBoard />

      {/* ── HABER HİYERARŞİSİ: lider + ikincil + sağ ray ── */}
      <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <HeroCard article={hero}/>
          {lead2.length > 0 && (
            <div className="mt-[18px] grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--border)] sm:grid-cols-2 lg:mt-0 lg:rounded-b-xl lg:rounded-t-none lg:border-t-0">
              {lead2.map(a => (
                <Link
                  key={a.filename}
                  href={`/${a.slug}`}
                  className="group flex flex-col gap-[7px] bg-[color:var(--bg)] px-5 py-[18px] transition-colors hover:bg-[color:var(--surface)]"
                >
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em]" style={{color:(CATS[a.category]?.c)||"var(--accent)"}}>
                    {(CATS[a.category]?.l)||a.category.toUpperCase()}
                  </span>
                  <span className="line-clamp-3 font-[family-name:var(--display)] text-[15px] font-bold leading-[1.34] tracking-[-0.02em] text-[color:var(--ink)] transition-colors group-hover:text-[color:var(--accent)]">
                    {a.title}
                  </span>
                  <span className="mt-auto font-mono text-[10px] tracking-[0.04em] text-[color:var(--muted)]">{Ago(a.created_at)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <aside className="flex flex-col gap-[18px] lg:sticky lg:top-[120px]">
          <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg)] px-[18px] pb-2 pt-4 shadow-sm">
            <div className="mb-1 border-b border-[color:var(--border2)] pb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">En Çok Okunan</div>
            {mostRead.map((a,i)=><RankedCard key={a.filename} article={a} index={i}/>)}
          </div>
          <MoversRail />
          {trending.length > 0 && (
            <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg)] px-[18px] pb-2 pt-4 shadow-sm">
              <div className="mb-1 border-b border-[color:var(--border2)] pb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">Gündemdekiler</div>
              <div className="flex flex-wrap gap-[7px] px-0 pb-3 pt-1">
                {trending.map(t=>(
                  <Link
                    key={t}
                    href={`/?q=${encodeURIComponent(t)}`}
                    className="rounded-full border border-[color:var(--border2)] bg-[color:var(--surface)] px-[11px] py-[5px] font-mono text-[11px] font-medium tracking-[0.02em] text-[color:var(--ink2)] transition-colors hover:border-[color:var(--accent)] hover:bg-[color:var(--accent-soft)] hover:text-[color:var(--accent)]"
                  >
                    {t}
                  </Link>
                ))}
              </div>
            </div>
          )}
          <div className="min-h-[280px]">
            <AdSlot position="sidebar" />
          </div>
        </aside>
      </div>

      {/* Lider altı üçlü şerit */}
      {strip.length > 0 && (
        <div className="mt-7 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--border)] md:grid-cols-3">
          {strip.map(a=><StripCard key={a.filename} article={a}/>)}
        </div>
      )}

      {/* Lider bloğu sonrası tek, etiketli reklam (CLS-güvenli) */}
      <AdSlot position="headerBanner" />

      {recent.length>0&&(
        <section className="section">
          <div className="sec-rule">
            <span className="sec-rule-label" style={{color:"var(--ink)"}}>Son Haberler</span>
            <div className="sec-rule-line"/>
          </div>
          <div className="resp-grid-4">
            {recent.map(a=><MedCard key={a.filename} article={a}/>)}
          </div>
        </section>
      )}

      <section className="section">
        <Newsletter />
      </section>

      {byCat.map(({cat,cfg,items}, idx)=> (
        <section key={cat} className="section">
          <div className="sec-rule">
            <span className="sec-rule-label" style={{color:cfg.c}}>{cfg.l}</span>
            <div className="sec-rule-line"/>
            <Link href={`/kategori/${cat}`} className="sec-rule-all">Tümünü gör →</Link>
          </div>
          <div className="resp-grid-4">
            {items.map(a=><MedCard key={a.filename} article={a}/>)}
          </div>
          {/* Akış ortasına yerleştirilmiş tek reklam (kategoriler arası) */}
          {idx === 1 && <AdSlot position="inArticle" />}
        </section>
      ))}

    </div>
  );
}
