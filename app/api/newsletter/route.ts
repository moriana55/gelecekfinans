import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Geçersiz email" }, { status: 400 });
  }

  try {
    await prisma.subscriber.upsert({
      where: { email },
      update: { active: true },
      create: { email },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
