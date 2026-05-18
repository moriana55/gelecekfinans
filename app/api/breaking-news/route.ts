import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const item = await prisma.breakingNews.findFirst({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(item || null, {
    headers: { "Cache-Control": "public, max-age=30" },
  });
}
