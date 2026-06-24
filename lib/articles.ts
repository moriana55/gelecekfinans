import { cache } from "react";
import { prisma } from "./db";
import type { Article } from "./types";

export type { Article } from "./types";

/**
 * `premium` kolonu henüz veritabanına eklenmemiş olabilir (owner `prisma db push`
 * çalıştırmadan önce). Bu durumda Prisma "column does not exist" hatası fırlatır.
 * Bu kontrol, hatanın eksik `premium` kolonundan kaynaklanıp kaynaklanmadığını
 * tespit eder; öyleyse sorguyu `premium` olmadan tekrar deneriz (premium:false).
 * Kolon mevcutsa davranış hiç değişmez.
 */
function isMissingPremiumColumn(err: unknown): boolean {
  const msg =
    err && typeof err === "object" && "message" in err
      ? String((err as { message?: unknown }).message ?? "")
      : String(err);
  // Prisma P2022 (column does not exist) veya genel "premium" sütun hatası.
  const code =
    err && typeof err === "object" && "code" in err
      ? String((err as { code?: unknown }).code ?? "")
      : "";
  return (
    code === "P2022" ||
    (/premium/i.test(msg) &&
      /(column|does not exist|undefined column|no such column|unknown column)/i.test(
        msg
      ))
  );
}

// React cache(): aynı render içinde aynı argümanlarla tekrarlı çağrılarda DB
// sorgusunu tek sefere indirir (request-level dedupe). Davranış değişmez —
// sonuçlar birebir aynı kalır, yalnızca tekrar eden sorgu önlenir.
export const getAllArticles = cache(async function getAllArticles(
  limit = 200
): Promise<Article[]> {
  let rows: Array<{
    title: string;
    meta: string;
    keyword: string | null;
    category: string;
    content: string;
    source: string | null;
    publishedAt: Date | null;
    createdAt: Date;
    slug: string;
    id: string;
    imageUrl: string | null;
    updatedAt: Date;
    premium?: boolean;
  }>;
  const baseQuery = {
    where: { status: "PUBLISHED" as const },
    orderBy: { publishedAt: "desc" as const },
    take: limit,
  };
  try {
    rows = await prisma.article.findMany(baseQuery);
  } catch (err) {
    if (!isMissingPremiumColumn(err)) {
      // `premium` ile ilgisiz gerçek bir hata: sayfayı çökertmek yerine
      // degrade ederek boş liste döndür (homepage temiz boş durum gösterir).
      console.error("[getAllArticles] sorgu başarısız:", err);
      return [];
    }
    // `premium` kolonu yok: kolonu hariç tutarak yeniden dene.
    rows = await prisma.article.findMany({
      ...baseQuery,
      select: {
        title: true,
        meta: true,
        keyword: true,
        category: true,
        content: true,
        source: true,
        publishedAt: true,
        createdAt: true,
        slug: true,
        id: true,
        imageUrl: true,
        updatedAt: true,
      },
    });
  }

  const slugs = rows.map((r) => `/${r.slug}`);
  const viewCounts = slugs.length > 0
    ? await prisma.pageView.groupBy({
        by: ["path"],
        where: { path: { in: slugs } },
        _count: { path: true },
      })
    : [];
  const viewMap = new Map(viewCounts.map((v) => [v.path, v._count.path]));

  return rows.map((r) => ({
    title: r.title,
    meta: r.meta,
    keyword: r.keyword || "",
    category: r.category,
    content: r.content,
    image_path: null,
    source: r.source || "",
    created_at: (r.publishedAt || r.createdAt).toISOString(),
    slug: r.slug,
    filename: r.id,
    imageUrl: r.imageUrl,
    views: viewMap.get(`/${r.slug}`) || 0,
    updatedAt: r.updatedAt.toISOString(),
    // Kolon yokken `premium` undefined gelir; default(false) semantiğiyle uyumlu.
    premium: r.premium ?? false,
  }));
});

// React cache(): generateMetadata + sayfa render'ı aynı slug'ı iki kez sorgular;
// cache() ile tek istekte tek DB sorgusu yapılır. Sonuç birebir aynı.
export const getArticleBySlug = cache(async function getArticleBySlug(
  slug: string
): Promise<Article | null> {
  const baseQuery = { where: { slug, status: "PUBLISHED" as const } };
  let r:
    | {
        title: string;
        meta: string;
        keyword: string | null;
        category: string;
        content: string;
        source: string | null;
        publishedAt: Date | null;
        createdAt: Date;
        slug: string;
        id: string;
        imageUrl: string | null;
        updatedAt: Date;
        premium?: boolean;
      }
    | null;
  try {
    r = await prisma.article.findFirst(baseQuery);
  } catch (err) {
    if (!isMissingPremiumColumn(err)) {
      console.error("[getArticleBySlug] sorgu başarısız:", err);
      return null;
    }
    // `premium` kolonu yok: kolonu hariç tutarak yeniden dene.
    r = await prisma.article.findFirst({
      ...baseQuery,
      select: {
        title: true,
        meta: true,
        keyword: true,
        category: true,
        content: true,
        source: true,
        publishedAt: true,
        createdAt: true,
        slug: true,
        id: true,
        imageUrl: true,
        updatedAt: true,
      },
    });
  }
  if (!r) return null;
  return {
    title: r.title,
    meta: r.meta,
    keyword: r.keyword || "",
    category: r.category,
    content: r.content,
    image_path: null,
    source: r.source || "",
    created_at: (r.publishedAt || r.createdAt).toISOString(),
    slug: r.slug,
    filename: r.id,
    imageUrl: r.imageUrl,
    updatedAt: r.updatedAt.toISOString(),
    // Kolon yokken `premium` undefined gelir; default(false) semantiğiyle uyumlu.
    premium: r.premium ?? false,
  };
});

export async function getArticlesByCategory(cat: string): Promise<Article[]> {
  const all = await getAllArticles();
  return all.filter((a) => a.category === cat);
}

/**
 * Premium içerik için ilk ~N kelimelik HTML teaser üretir. HTML etiketlerini
 * kabaca kelime sınırında keser ve açık kalan blok etiketlerini güvenli
 * şekilde sonlandırır (dangerouslySetInnerHTML ile kullanılır).
 */
export function buildTeaser(html: string, maxWords = 200): string {
  const tokens = html.split(/(<[^>]+>)/);
  let words = 0;
  const out: string[] = [];
  const openTags: string[] = [];
  const VOID = new Set(["br", "img", "hr", "input", "meta", "link"]);

  for (const tok of tokens) {
    if (words >= maxWords) break;
    if (tok.startsWith("<")) {
      out.push(tok);
      const m = tok.match(/^<\s*(\/?)\s*([a-zA-Z0-9]+)/);
      if (m) {
        const tag = m[2].toLowerCase();
        if (!VOID.has(tag) && !tok.endsWith("/>")) {
          if (m[1] === "/") openTags.pop();
          else openTags.push(tag);
        }
      }
    } else {
      const w = tok.split(/\s+/).filter(Boolean);
      if (words + w.length <= maxWords) {
        out.push(tok);
        words += w.length;
      } else {
        out.push(w.slice(0, maxWords - words).join(" ") + " …");
        words = maxWords;
      }
    }
  }
  // Açık kalan etiketleri kapat
  while (openTags.length) out.push(`</${openTags.pop()}>`);
  return out.join("");
}
