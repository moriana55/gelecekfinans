import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sanitizePreferences, signOptInToken, hasNewsletterSecret } from "@/lib/newsletter";
import { sendOptInConfirmation } from "@/lib/mail";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  // Rate limit: IP başına dakikada 5 abonelik denemesi.
  const ip = clientIp(req);
  const rl = rateLimit(`newsletter:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Çok fazla deneme. Lütfen biraz sonra tekrar deneyin." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const { email, preferences, source } = (body || {}) as {
    email?: unknown;
    preferences?: unknown;
    source?: unknown;
  };

  const normalizedEmail =
    typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!normalizedEmail || normalizedEmail.length > 254 || !EMAIL_RE.test(normalizedEmail)) {
    return NextResponse.json({ error: "Geçersiz email" }, { status: 400 });
  }

  const prefs = sanitizePreferences(preferences);
  const safeSource =
    typeof source === "string" ? source.slice(0, 40).replace(/[^\w-]/g, "") : "site-form";

  try {
    // Çift-onay: yeni veya doğrulanmamış aboneler confirmed=false kalır.
    await prisma.subscriber.upsert({
      where: { email: normalizedEmail },
      update: { active: true, preferences: prefs, source: safeSource || "site-form" },
      create: {
        email: normalizedEmail,
        preferences: prefs,
        source: safeSource || "site-form",
        confirmed: false,
      },
    });

    // Double opt-in: imzalı token ile onay maili gönder (env-gated).
    const token = signOptInToken(normalizedEmail);
    let confirmationSent = false;
    if (token) {
      confirmationSent = await sendOptInConfirmation(normalizedEmail, token);
    }

    return NextResponse.json({
      ok: true,
      // Anahtar yoksa onay maili atılamaz; geliştirme/kurulum için bilgi ver.
      requiresConfirmation: hasNewsletterSecret(),
      confirmationSent,
    });
  } catch {
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
