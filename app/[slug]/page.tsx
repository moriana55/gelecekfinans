import { getAllArticles, getArticleBySlug } from "@/lib/articles";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CATS, Ago } from "@/components/ArticleCard";
import { MedCard } from "@/components/ArticleCard";
import ReadingProgress from "@/components/ReadingProgress";
import ShareButtons from "@/components/ShareButtons";
import AdSlot from "@/components/AdSlot";
import { injectInternalLinks } from "@/lib/internal-links";

export const dynamic = "force-dynamic";
export const revalidate = 300;

const BASE = "https://gelecekfinans.com";

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params; const a=await getArticleBySlug(slug); if(!a)return{};
  const img=a.imageUrl;
  return{
    title:a.title,description:a.meta,keywords:a.keyword,
    alternates: { canonical: `${BASE}/${slug}` },
    openGraph:{title:a.title,description:a.meta,type:"article",publishedTime:a.created_at,url:`${BASE}/${slug}`,...(img&&{images:[{url:img}]})},
    twitter:{card:"summary_large_image",title:a.title,description:a.meta,...(img&&{images:[img]})},
  };
}

export default async function ArticlePage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params; const a=await getArticleBySlug(slug); if(!a)notFound();
  const cfg=CATS[a.category]??{l:a.category.toUpperCase(),c:"#555"};
  const img=a.imageUrl;
  const date=new Date(a.created_at).toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"});
  const url = `${BASE}/${a.slug}`;

  // Structured data
  const ld={
    "@context":"https://schema.org","@type":"NewsArticle",headline:a.title,
    description:a.meta,datePublished:a.created_at,keywords:a.keyword,
    mainEntityOfPage:{"@type":"WebPage","@id":url},
    author:{"@type":"Organization",name:"GelecekFinans",url:BASE},
    publisher:{"@type":"Organization",name:"GelecekFinans",url:BASE},
    ...(img&&{image:img})
  };

  // Breadcrumb structured data
  const breadcrumbLd = {
    "@context":"https://schema.org","@type":"BreadcrumbList",
    itemListElement:[
      {"@type":"ListItem",position:1,name:"Ana Sayfa",item:BASE},
      {"@type":"ListItem",position:2,name:cfg.l,item:`${BASE}/kategori/${a.category}`},
      {"@type":"ListItem",position:3,name:a.title,item:url},
    ]
  };

  // Related articles (same category, exclude current)
  const allArticles = await getAllArticles();
  const related = allArticles
    .filter(r => r.category === a.category && r.slug !== a.slug)
    .slice(0, 4);

  return(
    <div style={{maxWidth:720,margin:"0 auto",padding:"40px 24px 100px"}}>
      <ReadingProgress/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(ld)}}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumbLd)}}/>

      {/* Breadcrumb */}
      <nav style={{display:"flex",alignItems:"center",gap:8,marginBottom:28,fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",letterSpacing:".08em"}}>
        <Link href="/" style={{color:"var(--muted)"}}>Ana Sayfa</Link>
        <span>/</span>
        <Link href={`/kategori/${a.category}`} style={{color:cfg.c}}>{cfg.l}</Link>
        <span>/</span>
        <span style={{color:"var(--ink)"}}>{a.title.slice(0, 40)}...</span>
      </nav>

      {/* Category + date */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
        <span className="badge" style={{background:cfg.c}}>{cfg.l}</span>
        <span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",letterSpacing:".08em"}}>{date}</span>
        {a.source&&<span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",letterSpacing:".08em"}}>— {a.source}</span>}
      </div>

      {/* Title */}
      <h1 style={{fontFamily:"var(--serif)",fontSize:"clamp(28px,4vw,42px)",fontWeight:900,color:"var(--ink)",lineHeight:1.12,letterSpacing:"-.03em",marginBottom:16}}>
        {a.title}
      </h1>

      {/* Lead */}
      <p style={{fontFamily:"var(--sans)",fontSize:17,fontWeight:300,color:"var(--muted)",lineHeight:1.7,marginBottom:24,borderBottom:"1px solid var(--rule)",paddingBottom:24}}>
        {a.meta}
      </p>

      {/* Share buttons (top) */}
      <ShareButtons url={url} title={a.title} />

      {/* Keywords */}
      {a.keyword&&(
        <p style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:28}}>
          Konu: {a.keyword}
        </p>
      )}

      {/* Image */}
      {img&&(
        <figure style={{margin:"0 0 32px",borderRadius:4,overflow:"hidden",border:"1px solid var(--rule)",position:"relative",aspectRatio:"16/9"}}>
          <Image src={img} alt={a.title} fill style={{objectFit:"cover"}} sizes="720px" priority />
        </figure>
      )}

      {/* Body with internal links */}
      <article className="article-prose" dangerouslySetInnerHTML={{__html:injectInternalLinks(a.content, a.slug, allArticles)}}/>

      {/* In-article ad slot */}
      <AdSlot position="inArticle" />

      {/* Share buttons (bottom) */}
      <div style={{marginTop:32,paddingTop:24,borderTop:"1px solid var(--rule)"}}>
        <p style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:12}}>Paylaş</p>
        <ShareButtons url={url} title={a.title} />
      </div>

      {/* Related articles */}
      {related.length > 0 && (
        <section style={{marginTop:48,paddingTop:32,borderTop:"1px solid var(--rule)"}}>
          <div className="sec-rule" style={{paddingTop:0}}>
            <span className="sec-rule-label" style={{color:cfg.c}}>İlgili Haberler</span>
            <div className="sec-rule-line"/>
          </div>
          <div className="resp-grid-4" style={{gridTemplateColumns:"repeat(2, 1fr)"}}>
            {related.map(r=><MedCard key={r.filename} article={r}/>)}
          </div>
        </section>
      )}

      <div style={{marginTop:48,paddingTop:24,borderTop:"1px solid var(--rule)"}}>
        <Link href="/" style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",letterSpacing:".1em",textTransform:"uppercase"}}>
          ← Tüm Haberlere Dön
        </Link>
      </div>
    </div>
  );
}
