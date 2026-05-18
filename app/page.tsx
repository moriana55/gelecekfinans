import { getAllArticles } from "@/lib/articles";
import { HeroCard, StripCard, MedCard, RankedCard, CATS } from "@/components/ArticleCard";
import Newsletter from "@/components/Newsletter";
import Link from "next/link";
export const dynamic = "force-dynamic";
export const revalidate = 300;

export default async function HomePage() {
  const all = await getAllArticles();
  if (!all.length) return (
    <div style={{textAlign:"center",padding:"120px 24px",fontFamily:"var(--serif)",color:"var(--muted)"}}>
      <p style={{fontSize:28,fontWeight:700}}>Henüz makale yok</p>
      <p style={{fontSize:14,marginTop:8,fontFamily:"var(--sans)"}}>Panelden makale ürettikten sonra burada görünecek.</p>
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
    <div style={{maxWidth:1280,margin:"0 auto",padding:"0 24px 80px"}}>

      {/* HERO + SIDEBAR */}
      <div className="home-hero-grid">
        <div style={{borderRight:"1px solid var(--rule)"}}>
          <HeroCard article={hero}/>
          <div className="sub-strip" style={{borderTop:"1px solid var(--rule)"}}>
            {strip.map(a=><StripCard key={a.filename} article={a}/>)}
          </div>
        </div>
        <div className="ranked-box">
          <div className="ranked-head">Öne Çıkanlar</div>
          {ranked.map((a,i)=><RankedCard key={a.filename} article={a} index={i}/>)}
        </div>
      </div>

      {/* SON HABERLER */}
      {recent.length>0&&(
        <section>
          <div className="sec-rule">
            <span className="sec-rule-label" style={{color:"var(--ink)"}}>Son Haberler</span>
            <div className="sec-rule-line"/>
          </div>
          <div className="resp-grid-4">
            {recent.map(a=><MedCard key={a.filename} article={a}/>)}
          </div>
        </section>
      )}

      {/* NEWSLETTER */}
      <section style={{margin:"40px 0"}}>
        <Newsletter />
      </section>

      {/* KATEGORİ BÖLÜMLER */}
      {byCat.map(({cat,cfg,items})=>(
        <section key={cat}>
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
