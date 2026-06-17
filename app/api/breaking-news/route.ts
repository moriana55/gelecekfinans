import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isBreakingLive } from "@/lib/breaking";

export async function GET() {
  // Aktif son dakika haberlerini çek, süresi dolmuş olanları kodda ele.
  // (expiresAt yeni kolon; eski kayıtlarda null → createdAt + TTL ile değerlendirilir.)
  const items = await prisma.breakingNews.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const live = items.find((i) => isBreakingLive(i));

  return NextResponse.json(
    live ? { text: live.text, url: live.url } : null,
    { headers: { "Cache-Control": "public, max-age=30" } },
  );
}
