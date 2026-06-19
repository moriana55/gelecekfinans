import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const period = req.nextUrl.searchParams.get("period") || "7d";
  const days = period === "30d" ? 30 : period === "24h" ? 1 : 7;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const totalViews = await prisma.pageView.count({ where: { createdAt: { gte: since } } });

  // Top pages
  const topPages = await prisma.pageView.groupBy({
    by: ["path"],
    where: { createdAt: { gte: since } },
    _count: { path: true },
    orderBy: { _count: { path: "desc" } },
    take: 20,
  });

  // Daily breakdown
  const allViews = await prisma.pageView.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const dailyMap: Record<string, number> = {};
  for (const v of allViews) {
    const day = v.createdAt.toISOString().split("T")[0];
    dailyMap[day] = (dailyMap[day] || 0) + 1;
  }
  const daily = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

  // Top articles with titles
  const articlePaths = topPages
    .filter(p => p.path !== "/" && !p.path.startsWith("/kategori") && !p.path.startsWith("/sys-k3m8p") && !p.path.startsWith("/hakkimizda") && !p.path.startsWith("/iletisim"))
    .slice(0, 15);

  const slugs = articlePaths.map(p => p.path.replace(/^\//, ""));
  const articles = slugs.length > 0
    ? await prisma.article.findMany({
        where: { slug: { in: slugs } },
        select: { slug: true, title: true, category: true },
      })
    : [];
  const articleMap = new Map(articles.map(a => [a.slug, a]));

  const topArticles = articlePaths.map(p => {
    const slug = p.path.replace(/^\//, "");
    const article = articleMap.get(slug);
    return {
      path: p.path,
      views: p._count.path,
      title: article?.title || slug,
      category: article?.category || null,
    };
  });

  return NextResponse.json({
    totalViews,
    topPages: topPages.map(p => ({ path: p.path, views: p._count.path })),
    topArticles,
    daily,
  });
}
