import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ids, action } = await req.json() as { ids: string[]; action: string };
  if (!ids?.length || !action) {
    return NextResponse.json({ error: "ids ve action gerekli" }, { status: 400 });
  }

  switch (action) {
    case "publish":
      await prisma.article.updateMany({
        where: { id: { in: ids } },
        data: { status: "PUBLISHED", publishedAt: new Date() },
      });
      break;
    case "draft":
      await prisma.article.updateMany({
        where: { id: { in: ids } },
        data: { status: "DRAFT" },
      });
      break;
    case "archive":
      await prisma.article.updateMany({
        where: { id: { in: ids } },
        data: { status: "ARCHIVED" },
      });
      break;
    case "delete":
      await prisma.article.deleteMany({ where: { id: { in: ids } } });
      break;
    default:
      return NextResponse.json({ error: "Geçersiz action" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, affected: ids.length });
}
