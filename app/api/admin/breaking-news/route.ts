import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await prisma.breakingNews.findMany({ orderBy: { createdAt: "desc" }, take: 10 });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { text, url } = await req.json();
  if (!text) return NextResponse.json({ error: "Text gerekli" }, { status: 400 });

  // Deactivate old ones
  await prisma.breakingNews.updateMany({ where: { active: true }, data: { active: false } });
  const item = await prisma.breakingNews.create({ data: { text, url, active: true } });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  if (id) {
    await prisma.breakingNews.delete({ where: { id } });
  } else {
    await prisma.breakingNews.updateMany({ where: { active: true }, data: { active: false } });
  }
  return NextResponse.json({ ok: true });
}
