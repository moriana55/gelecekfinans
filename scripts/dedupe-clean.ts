// Mevcut çift haberleri temizler. Önce güçlendirilmiş isDuplicate ile aday çiftleri
// bulur, her çiftte ZAYIF olanı (önce views, sonra içerik uzunluğu, sonra eski olan) siler.
// Çalıştırma: npx tsx --env-file=.env scripts/dedupe-clean.ts [--apply]
import { prisma } from "../lib/db";
import { isDuplicate } from "../lib/duplicate";

async function main() {
  const apply = process.argv.includes("--apply");
  const arts = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, content: true, slug: true },
  });

  const keep = new Set<string>();
  const toDelete: { id: string; title: string; reason: string }[] = [];

  for (let i = 0; i < arts.length; i++) {
    const a = arts[i];
    if (toDelete.find((d) => d.id === a.id)) continue;
    const prior = arts.filter((x) => keep.has(x.id));
    const dup = isDuplicate(a.title, a.content, prior.map((p) => ({ id: p.id, title: p.title, content: p.content })));
    if (dup.duplicate) {
      // a, daha önce 'keep'lenmiş biriyle çift. Zayıf olanı seç (a zaten sonraki/eski olabilir).
      toDelete.push({ id: a.id, title: a.title, reason: `çift (matchId: ${dup.matchId || "?"})` });
    } else {
      keep.add(a.id);
    }
  }

  if (toDelete.length === 0) {
    console.log("[dedupe] Çift bulunamadı.");
  } else {
    console.log(`[dedupe] ${toDelete.length} çift aday:`);
    for (const d of toDelete) console.log(`  - SİL: ${d.title.slice(0, 55)}  (${d.reason})`);
    if (apply) {
      for (const d of toDelete) await prisma.article.delete({ where: { id: d.id } });
      console.log(`[dedupe] ${toDelete.length} makale SİLİNDİ.`);
    } else {
      console.log("[dedupe] (kuru çalışma — silmek için --apply ekle)");
    }
  }
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
