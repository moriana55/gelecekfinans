import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { computeExpiry, effectiveExpiry, isBreakingLive, DEFAULT_BREAKING_TTL_HOURS } from "@/lib/breaking";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await prisma.breakingNews.findMany({ orderBy: { createdAt: "desc" }, take: 10 });
  const now = new Date();

  // Süresi dolmuş ama hâlâ active=true görünen kayıtları pasifleştir (otomatik temizlik).
  const expiredIds = rows.filter((r) => r.active && !isBreakingLive(r, now)).map((r) => r.id);
  if (expiredIds.length > 0) {
    await prisma.breakingNews.updateMany({ where: { id: { in: expiredIds } }, data: { active: false } });
  }

  const items = rows.map((r) => ({
    ...r,
    active: r.active && !expiredIds.includes(r.id),
    live: isBreakingLive(r, now),
    expiresAt: effectiveExpiry(r).toISOString(),
  }));

  return NextResponse.json({ items, defaultTtlHours: DEFAULT_BREAKING_TTL_HOURS });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const url = typeof body.url === "string" && body.url.trim() ? body.url.trim() : null;
  const ttlHours = typeof body.ttlHours === "number" ? body.ttlHours : null;

  if (!text) return NextResponse.json({ error: "Text gerekli" }, { status: 400 });
  if (text.length > 280) return NextResponse.json({ error: "Metin çok uzun (max 280)" }, { status: 400 });
  if (url && !/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: "Geçersiz link (http/https olmalı)" }, { status: 400 });
  }

  // Eski aktif olanları kapat
  await prisma.breakingNews.updateMany({ where: { active: true }, data: { active: false } });

  const expiresAt = computeExpiry(ttlHours);
  const item = await prisma.breakingNews.create({ data: { text, url, active: true, expiresAt } });
  return NextResponse.json({ ...item, expiresAt: expiresAt.toISOString() });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json().catch(() => ({}));
  if (id) {
    await prisma.breakingNews.delete({ where: { id } });
  } else {
    await prisma.breakingNews.updateMany({ where: { active: true }, data: { active: false } });
  }
  return NextResponse.json({ ok: true });
}
