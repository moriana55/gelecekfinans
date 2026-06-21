// Mevcut makalelerin SEO eksiklerini (harici link + stored seoScore) düzeltir.
// AI maliyeti YOKTUR — saf metin işlemi + yeniden skorlama.
//
// Ne yapar:
//   (a) İçerikte harici link yoksa ensureExternalLink ile kategoriye uygun resmi kaynak ekler.
//   (b) analyzeSeo({..., imageUrl}) ile yeniden skorlar (kapak görseli görsel kontrolüne dahil).
//   (c) seoScore'u (ve değiştiyse content'i) DB'de günceller.
//
// KURU ÇALIŞMA (varsayılan, --apply YOK): hiçbir şey YAZMAZ, sadece ne değişeceğini raporlar.
// UYGULAMA: --apply bayrağı ile DB'ye yazar.
//
// Çalıştırma:
//   Kuru:     npx tsx --env-file=.env.local --env-file=.env scripts/seo-fix-existing.ts
//   Uygula:   npx tsx --env-file=.env.local --env-file=.env scripts/seo-fix-existing.ts --apply

import { prisma } from "../lib/db";
import { analyzeSeo } from "../lib/seo";
import { ensureExternalLink } from "../lib/bot/external-link";

function hasExternalLink(content: string): boolean {
  return /href=["']https?:\/\/[^"']*["']/i.test(content);
}

async function main() {
  const apply = process.argv.includes("--apply");
  console.log(`[seo-fix] mod: ${apply ? "UYGULA (DB'ye yazılacak)" : "KURU ÇALIŞMA (hiçbir şey yazılmayacak)"}`);

  const articles = await prisma.article.findMany({
    select: {
      id: true, title: true, meta: true, keyword: true,
      content: true, slug: true, category: true, imageUrl: true, seoScore: true,
    },
    orderBy: { createdAt: "desc" },
  });

  console.log(`[seo-fix] ${articles.length} makale incelenecek.\n`);

  let linkAdded = 0;
  let scoreChanged = 0;
  let unchanged = 0;

  for (const a of articles) {
    // (a) Harici link eksikse ekle.
    const needsLink = !hasExternalLink(a.content);
    const newContent = needsLink
      ? ensureExternalLink(a.content, a.category, a.keyword)
      : a.content;
    const linkWasAdded = needsLink && newContent !== a.content;

    // (b) Yeni içerik + kapak görseliyle yeniden skorla.
    const seo = analyzeSeo({
      title: a.title, meta: a.meta, keyword: a.keyword,
      content: newContent, slug: a.slug, imageUrl: a.imageUrl,
    });

    const oldScore = a.seoScore ?? 0;
    const scoreWasChanged = seo.score !== oldScore;

    if (!linkWasAdded && !scoreWasChanged) {
      unchanged++;
      continue;
    }

    if (linkWasAdded) linkAdded++;
    if (scoreWasChanged) scoreChanged++;

    const changes: string[] = [];
    if (linkWasAdded) changes.push("harici link eklendi");
    if (scoreWasChanged) changes.push(`skor ${oldScore} → ${seo.score}`);

    console.log(`[${apply ? "YAZ" : "KURU"}] ${a.title.slice(0, 55)} :: ${changes.join(", ")}`);

    if (apply) {
      await prisma.article.update({
        where: { id: a.id },
        data: {
          ...(linkWasAdded ? { content: newContent } : {}),
          seoScore: seo.score,
        },
      });
    }
  }

  console.log(`\n[seo-fix] BİTTİ`);
  console.log(`  harici link eklenecek/eklenen : ${linkAdded}`);
  console.log(`  skoru değişecek/değişen       : ${scoreChanged}`);
  console.log(`  değişmeyen                    : ${unchanged}`);
  if (!apply) {
    console.log(`\n  Bu KURU çalışmaydı, DB'ye HİÇBİR ŞEY yazılmadı.`);
    console.log(`  Uygulamak için: npx tsx --env-file=.env.local --env-file=.env scripts/seo-fix-existing.ts --apply`);
  }

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
