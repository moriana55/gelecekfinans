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
      <div className="home-lead">
        <div className="home-lead-main">
          <HeroCard article={hero}/>
          {lead2.length > 0 && (
            <div className="home-lead-sub">
              {lead2.map(a => (
                <Link key={a.filename} href={`/${a.slug}`} className="lead-sub-item">
                  <span className="lead-sub-cat" style={{color:(CATS[a.category]?.c)||"var(--accent)"}}>
                    {(CATS[a.category]?.l)||a.category.toUpperCase()}
                  </span>
                  <span className="lead-sub-title">{a.title}</span>
                  <span className="lead-sub-meta">{Ago(a.created_at)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <aside className="home-rail">
          <div className="rail-card">
            <div className="rail-head">En Çok Okunan</div>
            {mostRead.map((a,i)=><RankedCard key={a.filename} article={a} index={i}/>)}
          </div>
          <MoversRail />
          {trending.length > 0 && (
            <div className="rail-card">
              <div className="rail-head">Gündemdekiler</div>
              <div className="rail-chips">
                {trending.map(t=>(
                  <Link key={t} href={`/?q=${encodeURIComponent(t)}`} className="rail-chip">{t}</Link>
                ))}
              </div>
            </div>
          )}
          <div className="rail-ad">
            <AdSlot position="sidebar" />
          </div>
        </aside>
      </div>

      {/* Lider altı üçlü şerit */}
      {strip.length > 0 && (
        <div className="home-strip-row">
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
