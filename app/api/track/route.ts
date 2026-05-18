import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { path } = await req.json();
  if (!path || typeof path !== "string") {
    return NextResponse.json(null, { status: 400 });
  }
  await prisma.pageView.create({ data: { path } });
  return NextResponse.json({ ok: true });
}
