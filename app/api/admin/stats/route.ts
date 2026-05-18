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

  return NextResponse.json({
    totalViews,
    topPages: topPages.map(p => ({ path: p.path, views: p._count.path })),
    daily,
  });
}
