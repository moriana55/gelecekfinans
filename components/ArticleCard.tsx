import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/types";

export const CATS: Record<string, {l:string;c:string}> = {
  kripto: {l:"KRİPTO",c:"#B34700"},
  borsa:  {l:"BORSA", c:"#1A6B35"},
  döviz:  {l:"DÖVİZ", c:"#1A4A8A"},
  altın:  {l:"ALTIN", c:"#8B6914"},
  ekonomi:{l:"EKONOMİ",c:"#6B3070"},
};

function Badge({cat}:{cat:string}){
  const c=CATS[cat]??{l:cat.toUpperCase(),c:"#555"};
  return <span className="badge" style={{background:c.c}}>{c.l}</span>;
}
export function Ago(d:string){
  const s=(Date.now()-new Date(d).getTime())/1000;
  if(s<3600)return`${Math.floor(s/60)} dk`;
  if(s<86400)return`${Math.floor(s/3600)} sa`;
  return new Date(d).toLocaleDateString("tr-TR",{day:"numeric",month:"short",year:"numeric"});
}

function ArticleImage({src, alt, className, style}: {src: string; alt: string; className?: string; style?: React.CSSProperties}) {
  if (src.startsWith("/api/")) {
    return <img src={src} alt={alt} className={className} style={style} loading="lazy" />;
  }
  return (
    <div style={{position:"relative", ...style}}>
      <Image src={src} alt={alt} fill sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw" style={{objectFit:"cover"}} className={className} />
    </div>
  );
}

/* ─── HERO: editorial left-text / right-image ─── */
export function HeroCard({article}:{article:Article}){
  const img=article.imageUrl;
  return(
    <Link href={`/${article.slug}`} className="hero-editorial" style={{display:"grid",gridTemplateColumns:"1fr 480px",borderBottom:"1px solid var(--rule)"}}>
      <div className="hero-text-col">
        <div>
          <div className="hero-eyebrow">
            <Badge cat={article.category}/>
          </div>
          <h2 className="hero-headline">{article.title}</h2>
          <p className="hero-desc">{article.meta}</p>
        </div>
        <div className="hero-meta">
          <span>{Ago(article.created_at)}</span>
          {article.source&&<><span className="hero-meta-dot"/><span>{article.source}</span></>}
        </div>
      </div>
      <div className="hero-img-col">
        {img
          ? img.startsWith("/api/")
            ? <img src={img} alt={article.title} loading="lazy" />
            : <Image src={img} alt={article.title} fill sizes="480px" style={{objectFit:"cover"}} priority />
          : <div style={{width:"100%",height:"100%",background:"var(--ground2)",minHeight:420}}/>
        }
      </div>
    </Link>
  );
}

/* ─── STRIP card (3-column below hero) ─── */
export function StripCard({article}:{article:Article}){
  const img=article.imageUrl;
  return(
    <Link href={`/${article.slug}`} className="strip-card">
      {img
        ? <ArticleImage src={img} alt={article.title} className="strip-card-img" style={{width:"100%",aspectRatio:"16/8"}} />
        : <div style={{width:"100%",aspectRatio:"16/8",background:"var(--ground2)",borderRadius:4,marginBottom:12}}/>
      }
      <Badge cat={article.category}/>
      <h3 className="strip-card-title">{article.title}</h3>
      <p className="strip-card-meta">{Ago(article.created_at)}{article.source&&` — ${article.source}`}</p>
    </Link>
  );
}

/* ─── GRID card ─── */
export function MedCard({article}:{article:Article}){
  const img=article.imageUrl;
  return(
    <Link href={`/${article.slug}`} className="grid-card">
      {img
        ? <div style={{overflow:"hidden",borderRadius:2,position:"relative",aspectRatio:"16/9"}}>
            {img.startsWith("/api/")
              ? <img src={img} alt={article.title} className="grid-card-img" loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover"}} />
              : <Image src={img} alt={article.title} fill sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw" style={{objectFit:"cover"}} />
            }
          </div>
        : <div style={{width:"100%",aspectRatio:"16/9",background:"var(--ground2)",borderRadius:2}}/>
      }
      <div className="grid-card-body">
        <Badge cat={article.category}/>
        <h3 className="grid-card-title">{article.title}</h3>
        <p className="grid-card-meta">{Ago(article.created_at)}</p>
      </div>
    </Link>
  );
}

/* ─── RANKED sidebar row ─── */
export function RankedCard({article,index}:{article:Article;index:number}){
  const img=article.imageUrl;
  const c=CATS[article.category];
  return(
    <Link href={`/${article.slug}`} className="ranked-row">
      <span className="ranked-n">{index+1}</span>
      <div style={{flex:1,minWidth:0}}>
        {c&&<span style={{fontFamily:"var(--mono)",fontSize:9,fontWeight:600,letterSpacing:".12em",textTransform:"uppercase",color:c.c}}>{c.l}</span>}
        <p className="ranked-row-title" style={{marginTop:3}}>{article.title}</p>
        <p className="ranked-row-meta">{Ago(article.created_at)}</p>
      </div>
      {img&&<div style={{width:60,height:46,borderRadius:2,overflow:"hidden",flexShrink:0,position:"relative"}}>
        {img.startsWith("/api/")
          ? <img src={img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} loading="lazy" />
          : <Image src={img} alt="" fill sizes="60px" style={{objectFit:"cover"}} />
        }
      </div>}
    </Link>
  );
}

export default function ArticleCard({article,big=false}:{article:Article;big?:boolean}){
  return big?<HeroCard article={article}/>:<MedCard article={article}/>;
}
