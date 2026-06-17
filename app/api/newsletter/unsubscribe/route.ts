import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return new Response("Geçersiz istek", { status: 400 });

  const decoded = decodeURIComponent(email);
  await prisma.subscriber.updateMany({
    where: { email: decoded },
    data: { active: false },
  });

  return new Response(
    `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><title>Abonelik İptal</title></head>
<body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f5f5f5">
<div style="text-align:center;background:#fff;padding:40px;border-radius:12px;max-width:400px">
<h1 style="font-size:20px;color:#111">Aboneliğiniz iptal edildi</h1>
<p style="color:#666;font-size:14px">Artık GelecekFinans bültenlerini almayacaksınız.</p>
<a href="https://gelecekfinans.com" style="color:#c73030;font-size:13px">Ana sayfaya dön</a>
</div></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
