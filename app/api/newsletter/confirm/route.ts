import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifyOptInToken } from "@/lib/newsletter";

function html(title: string, body: string, ok: boolean) {
  return new Response(
    `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title}</title></head>
<body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f5f5f5">
<div style="text-align:center;background:#fff;padding:40px;border-radius:12px;max-width:420px">
<h1 style="font-size:20px;color:${ok ? "#16a34a" : "#dc2626"}">${title}</h1>
<p style="color:#666;font-size:14px">${body}</p>
<a href="https://gelecekfinans.com" style="color:#c73030;font-size:13px">Ana sayfaya dön</a>
</div></body></html>`,
    { status: ok ? 200 : 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const email = verifyOptInToken(token);

  if (!email) {
    return html("Onay başarısız", "Bağlantı geçersiz veya süresi dolmuş. Lütfen tekrar abone olun.", false);
  }

  await prisma.subscriber.updateMany({
    where: { email },
    data: { active: true, confirmed: true, confirmedAt: new Date() },
  });

  return html("Aboneliğiniz onaylandı", "Artık GelecekFinans bültenlerini alacaksınız. Teşekkürler!", true);
}
