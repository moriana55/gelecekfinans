import { prisma } from "./db";
import type { Article } from "./types";

export type { Article } from "./types";

export async function getAllArticles(limit = 200): Promise<Article[]> {
  const rows = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

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
  };
}

export async function getArticlesByCategory(cat: string): Promise<Article[]> {
  const all = await getAllArticles();
  return all.filter((a) => a.category === cat);
}
