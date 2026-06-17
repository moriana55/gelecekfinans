import { getAllArticles } from "@/lib/articles";
import { HeroCard, StripCard, MedCard, RankedCard, CATS } from "@/components/ArticleCard";
import Newsletter from "@/components/Newsletter";
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

  const hero   = all[0];
  const strip  = all.slice(1, 4);
  const ranked = all.slice(4, 9);
  const recent = all.slice(9, 21);
  const byCat  = Object.keys(CATS).map(cat=>({
    cat, cfg: CATS[cat],
    items: all.filter(a=>a.category===cat).slice(0,4),
  })).filter(g=>g.items.length>=2);

  return (
    <div className="container page-home">

      <div className="home-hero-grid">
        <div>
          <HeroCard article={hero}/>
          <div className="sub-strip">
            {strip.map(a=><StripCard key={a.filename} article={a}/>)}
          </div>
        </div>
        {ranked.length > 0 && (
          <div className="ranked-box">
            <div className="ranked-head">Öne Çıkanlar</div>
            {ranked.map((a,i)=><RankedCard key={a.filename} article={a} index={i}/>)}
          </div>
        )}
      </div>

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

      {byCat.map(({cat,cfg,items})=> (
        <section key={cat} className="section">
          <div className="sec-rule">
            <span className="sec-rule-label" style={{color:cfg.c}}>{cfg.l}</span>
            <div className="sec-rule-line"/>
            <Link href={`/kategori/${cat}`} className="sec-rule-all">Tümünü gör →</Link>
          </div>
          <div className="resp-grid-4">
            {items.map(a=><MedCard key={a.filename} article={a}/>)}
          </div>
        </section>
      ))}

    </div>
  );
}
