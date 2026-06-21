import { getAllArticles, getArticleBySlug, buildTeaser } from "@/lib/articles";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CATS, MedCard } from "@/components/ArticleCard";
import ReadingProgress from "@/components/ReadingProgress";
import ShareButtons from "@/components/ShareButtons";
import AdSlot from "@/components/AdSlot";
import { injectInternalLinks } from "@/lib/internal-links";
import { readingTime } from "@/lib/reading-time";

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
  const readTime = readingTime(a.content);

  // Structured data
  const ld={
    "@context":"https://schema.org","@type":"NewsArticle",headline:a.title,
    description:a.meta,datePublished:a.created_at,dateModified:a.updatedAt||a.created_at,keywords:a.keyword,
    mainEntityOfPage:{"@type":"WebPage","@id":url},
    author:{"@type":"Organization",name:"GelecekFinans",url:BASE},
    publisher:{"@type":"Organization",name:"GelecekFinans",url:BASE,logo:{"@type":"ImageObject",url:`${BASE}/icon.svg`}},
    ...(img&&{image:img}),
    ...(a.premium&&{
      isAccessibleForFree:false,
      hasPart:{"@type":"WebPageElement",isAccessibleForFree:false,cssSelector:".article-prose"},
    }),
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

  const tags = a.keyword ? a.keyword.split(/[,;]/).map(k => k.trim()).filter(Boolean) : [];

  // Premium içerik kapısı: giriş yapmış kullanıcılar tam içeriği görür,
  // diğerleri ~200 kelimelik teaser + üye girişi kapısı görür.
  const session = a.premium ? await getServerSession(authOptions) : null;
  const gated = !!a.premium && !session;
  const bodyHtml = gated
    ? buildTeaser(a.content, 200)
    : injectInternalLinks(a.content, a.slug, allArticles);

  return(
    <div className="article-container">
      <ReadingProgress/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(ld)}}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumbLd)}}/>

      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link href="/">Ana Sayfa</Link>
        <span className="breadcrumb-sep">/</span>
        <Link href={`/kategori/${a.category}`} style={{color:cfg.c}}>{cfg.l}</Link>
        <span className="breadcrumb-sep">/</span>
        <span style={{color:"var(--ink)"}}>{a.title.slice(0, 40)}...</span>
      </nav>

      {/* Category + date */}
      <div className="article-meta-row">
        <span className="tag" style={{background:cfg.c}}>{cfg.l}</span>
        <span className="article-date">{date}</span>
        <span className="article-date">{readTime}</span>
      </div>

      {/* Title */}
      <h1 className="article-title">{a.title}</h1>

      {/* Lead */}
      <p className="article-lead">{a.meta}</p>

      {/* Share buttons (top) */}
      <ShareButtons url={url} title={a.title} />

      {/* Image */}
      {img&&(
        <figure className="article-figure">
          <Image src={img} alt={a.title} fill style={{objectFit:"cover"}} sizes="720px" priority />
        </figure>
      )}

      {/* Body with internal links (premium teaser if gated) */}
      <article className="article-prose" dangerouslySetInnerHTML={{__html:bodyHtml}}/>

      {/* Premium gate */}
      {gated && (
        <div className="premium-gate">
          <div className="premium-card">
            <span className="premium-pill">PREMIUM İÇERİK</span>
            <h2>Yazının devamını okumak için üye girişi yapın</h2>
            <p>
              Bu analiz GelecekFinans üyelerine özeldir. Ücretsiz hesabınızla
              tüm premium içeriklere erişebilirsiniz.
            </p>
            {/* Yönetim giriş bağlantısı gizli olduğundan public sayfada ifşa edilmez. */}
            <span className="premium-note">Yakında üyelik sistemi aktif olacak.</span>
          </div>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="article-tags">
          {tags.map(tag => (
            <span key={tag} className="article-tag">{tag}</span>
          ))}
        </div>
      )}

      {/* Author box */}
      <div className="author-box">
        <div className="author-avatar">GF</div>
        <div>
          <div className="author-name">GelecekFinans</div>
          <div className="author-role">Finans & Ekonomi Haberleri Editörü</div>
        </div>
      </div>

      {/* In-article ad slot */}
      <AdSlot position="inArticle" />

      {/* Share buttons (bottom) */}
      <div className="article-share-bottom">
        <p className="article-share-label">Paylaş</p>
        <ShareButtons url={url} title={a.title} />
      </div>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="related-section">
          <div className="sec-rule" style={{paddingTop:0}}>
            <span className="sec-rule-label" style={{color:cfg.c}}>İlgili Haberler</span>
            <div className="sec-rule-line"/>
          </div>
          <div className="resp-grid-4" style={{gridTemplateColumns:"repeat(2, 1fr)"}}>
            {related.map(r=><MedCard key={r.filename} article={r}/>)}
          </div>
        </section>
      )}

      <div className="article-back">
        <Link href="/" className="back-link">
          ← Tüm Haberlere Dön
        </Link>
      </div>
    </div>
  );
}
