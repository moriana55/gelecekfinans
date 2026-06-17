import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { analyzeSeo } from "@/lib/seo";
import { isDuplicate } from "@/lib/duplicate";
import { getTopics } from "@/lib/bot/topics";
import { writeArticle } from "@/lib/bot/writer";
import { fetchUnsplashImage } from "@/lib/bot/images";
import { autoLink } from "@/lib/bot/linker";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const count: number = Math.min(body.count || 3, 10);
  const category: string = body.category || "";
  const targetWords: number = body.words || 1000;

  const run = await prisma.botRun.create({
    data: { articlesFound: 0 },
  });

  const topics = await getTopics(count * 3, category || undefined);

  await prisma.botRun.update({
    where: { id: run.id },
    data: { articlesFound: topics.length },
  });

  if (topics.length === 0) {
    await prisma.botRun.update({
      where: { id: run.id },
      data: { finishedAt: new Date(), status: "completed", errors: "Konu bulunamadı" },
    });
    return NextResponse.json({ added: 0, duplicatesSkipped: 0, errors: ["Konu bulunamadı"], runId: run.id });
  }

  const recent = await prisma.article.findMany({
    where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    select: { id: true, title: true, content: true },
  });

  let added = 0;
  let duplicatesSkipped = 0;
  const errors: string[] = [];

  for (const topic of topics) {
    if (added >= count) break;

    try {
      const dupTitle = isDuplicate(topic.title, topic.summary, recent);
      if (dupTitle.duplicate) {
        duplicatesSkipped++;
        continue;
      }

      const article = await writeArticle(topic, targetWords);
      const slug = slugify(article.title);

      const existing = await prisma.article.findUnique({ where: { slug } });
      if (existing) {
        duplicatesSkipped++;
        continue;
      }

      const dupContent = isDuplicate(article.title, article.content, recent);
      if (dupContent.duplicate) {
        duplicatesSkipped++;
        continue;
      }

      const linkedContent = await autoLink(article.content, article.category, slug);
      article.content = linkedContent;

      const seo = analyzeSeo({
        title: article.title, meta: article.meta,
        keyword: article.keyword, content: article.content, slug,
      });

      const created = await prisma.article.create({
        data: {
          title: article.title,
          slug,
          meta: article.meta,
          keyword: article.keyword || null,
          category: article.category,
          content: article.content,
          imageUrl: await fetchUnsplashImage(article.keyword || "", article.category) || null,
          source: article.source,
          articleSource: "BOT",
          status: seo.score >= 50 ? "PUBLISHED" : "DRAFT",
          seoScore: seo.score,
          publishedAt: seo.score >= 50 ? new Date() : null,
        },
      });

      recent.push({ id: created.id, title: created.title, content: created.content });
      added++;
    } catch (e) {
      errors.push(`${topic.title.slice(0, 40)}: ${(e as Error).message}`);
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

  return NextResponse.json({ added, duplicatesSkipped, errors, runId: run.id });
}
