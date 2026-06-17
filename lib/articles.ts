import { prisma } from "./db";
import type { Article } from "./types";

export type { Article } from "./types";

export async function getAllArticles(limit = 200): Promise<Article[]> {
  const rows = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

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
    premium: r.premium,
  }));
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const r = await prisma.article.findFirst({
    where: { slug, status: "PUBLISHED" },
  });
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
    premium: r.premium,
  };
}

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
