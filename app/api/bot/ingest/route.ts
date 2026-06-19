import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { analyzeSeo } from "@/lib/seo";
import { isDuplicate } from "@/lib/duplicate";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.BOT_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const articles: Array<{
    title: string; meta: string; keyword?: string; category: string;
    content: string; image_path?: string; source?: string; created_at?: string;
  }> = Array.isArray(body) ? body : [body];

  const run = await prisma.botRun.create({
    data: { articlesFound: articles.length },
  });

  let added = 0;
  let duplicatesSkipped = 0;
  const errors: string[] = [];

  const recent = await prisma.article.findMany({
    where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    select: { id: true, title: true, content: true },
  });

  for (const item of articles) {
    try {
      if (!item.title || !item.content || !item.category) {
        errors.push(`Eksik alan: ${item.title?.slice(0, 30) || "no title"}`);
        continue;
      }

      const dupCheck = isDuplicate(item.title, item.content, recent);
      if (dupCheck.duplicate) {
        duplicatesSkipped++;
        continue;
      }

      const slug = slugify(item.title);
      const existing = await prisma.article.findUnique({ where: { slug } });
      if (existing) {
        duplicatesSkipped++;
        continue;
      }

      const seo = analyzeSeo({
        title: item.title, meta: item.meta, keyword: item.keyword || null,
        content: item.content, slug, imageUrl: item.image_path || null,
      });

      const article = await prisma.article.create({
        data: {
          title: item.title,
          slug,
          meta: item.meta,
          keyword: item.keyword || null,
          category: item.category,
          content: item.content,
          imageUrl: item.image_path || null,
          source: item.source || null,
          articleSource: "BOT",
          status: "DRAFT", // Bot makaleleri DRAFT gelir; owner görsel ekleyip elle yayınlar
          seoScore: seo.score,
          publishedAt: null,
          createdAt: new Date(item.created_at || Date.now()),
        },
      });

      recent.push({ id: article.id, title: article.title, content: article.content });
      added++;
    } catch (e) {
      errors.push(`Hata: ${item.title?.slice(0, 30)} - ${(e as Error).message}`);
    }
  }

  await prisma.botRun.update({
    where: { id: run.id },
    data: {
      finishedAt: new Date(),
      articlesAdded: added,
      duplicatesSkipped,
      errors: errors.length ? errors.join("\n") : null,
      status: "completed",
    },
  });

  return NextResponse.json({ added, duplicatesSkipped, errors: errors.length, runId: run.id });
}
