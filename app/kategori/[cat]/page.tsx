import { getArticlesByCategory } from "@/lib/articles";
import { MedCard, CATS } from "@/components/ArticleCard";
import Newsletter from "@/components/Newsletter";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 300;

const PER_PAGE = 20;
const BASE = "https://gelecekfinans.com";

export async function generateMetadata({params}:{params:Promise<{cat:string}>}):Promise<Metadata>{
  const {cat}=await params; const c=CATS[cat]; if(!c)return{};
  return{
    title:`${c.l} Haberleri`,
    description:`Güncel ${c.l.toLowerCase()} haberleri ve son dakika gelişmeleri.`,
    alternates: { canonical: `${BASE}/kategori/${cat}` },
  };
}

export default async function CatPage({params, searchParams}:{params:Promise<{cat:string}>; searchParams:Promise<{sayfa?:string}>}){
  const {cat}=await params; const cfg=CATS[cat]; if(!cfg)notFound();
  const {sayfa}=await searchParams;
  const page = Math.max(1, parseInt(sayfa || "1"));
  const allArts = await getArticlesByCategory(cat);
  const totalPages = Math.ceil(allArts.length / PER_PAGE);
  const arts = allArts.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return(
    <div style={{maxWidth:1280,margin:"0 auto",padding:"28px 24px 80px"}}>
      <div style={{marginBottom:28,paddingBottom:16,borderBottom:`3px solid ${cfg.c}`}}>
        <span className="badge" style={{background:cfg.c,marginBottom:10,display:"inline-block"}}>{cfg.l}</span>
        <h1 style={{fontSize:28,fontWeight:900,color:"var(--ink)",letterSpacing:"-.03em"}}>{cfg.l} Haberleri</h1>
        <p style={{fontSize:13,color:"var(--muted)",marginTop:6}}>{allArts.length} haber</p>
      </div>

      <div className="resp-grid-4">
        {arts.map(a=><MedCard key={a.filename} article={a}/>)}
      </div>

      {!arts.length && <p style={{textAlign:"center",padding:"60px 0",color:"var(--muted)"}}>Bu kategoride henüz haber yok.</p>}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav style={{display:"flex",justifyContent:"center",gap:8,marginTop:32}}>
          {page > 1 && (
            <Link href={`/kategori/${cat}?sayfa=${page-1}`}
              style={{padding:"8px 14px",border:"1px solid var(--rule)",borderRadius:4,fontSize:12,color:"var(--muted)",fontFamily:"var(--mono)"}}>
              ← Önceki
            </Link>
          )}
          {Array.from({length:Math.min(totalPages, 7)}, (_, i) => {
            const p = i + 1;
            return (
              <Link key={p} href={`/kategori/${cat}?sayfa=${p}`}
                style={{padding:"8px 12px",border:"1px solid var(--rule)",borderRadius:4,fontSize:12,fontFamily:"var(--mono)",
                  background: p === page ? "var(--ink)" : "transparent",
                  color: p === page ? "var(--ground)" : "var(--muted)"}}>
                {p}
              </Link>
            );
          })}
          {page < totalPages && (
            <Link href={`/kategori/${cat}?sayfa=${page+1}`}
              style={{padding:"8px 14px",border:"1px solid var(--rule)",borderRadius:4,fontSize:12,color:"var(--muted)",fontFamily:"var(--mono)"}}>
              Sonraki →
            </Link>
          )}
        </nav>
      )}

      {/* Newsletter */}
      <section style={{marginTop:48}}>
        <Newsletter />
      </section>
    </div>
  );
}
