// Finans/ekonomi ile alakasız (metro kazası vb.) mevcut makaleleri bulur ve siler.
// Çalıştırma: npx tsx --env-file=.env scripts/delete-offtopic.ts [--apply]
import { prisma } from "../lib/db";
import { CATEGORIES } from "../lib/bot/config";

// topics.ts'teki ile aynı alaka listesi.
const ECONOMY_RELEVANCE = [
  "ekonomi","ekonomik","finans","piyasa","borsa","hisse","endeks","yatırım","yatırımcı",
  "dolar","euro","sterlin","kur","döviz","altın","gram","ons","faiz","enflasyon","merkez bankası",
  "tcmb","fed","büyüme","resesyon","durgunluk","ihracat","ithalat","ticaret","gümrük","tarife",
  "bütçe","vergi","teşvik","istihdam","işsizlik","asgari ücret","maaş","zam","sanayi","üretim",
  "kapasite","gsyih","gsyh","üfe","tüfe","gfe","cari açık","rezerv","kredi","borç","tahvil",
  "banka","bankacılık","şirket","bilanço","temettü","halka arz","imf","dünya bankası","petrol",
  "doğalgaz","enerji","emtia","konut","kira","fiyat","güven endeksi","tüketici",
];

function isRelevant(title: string, content: string): boolean {
  const text = (title + " " + content).toLowerCase();
  for (const kws of Object.values(CATEGORIES)) if (kws.some((k) => text.includes(k))) return true;
  return ECONOMY_RELEVANCE.some((k) => text.includes(k));
}

async function main() {
  const apply = process.argv.includes("--apply");
  const arts = await prisma.article.findMany({ select: { id: true, title: true, content: true } });
  const offtopic = arts.filter((a) => !isRelevant(a.title, a.content.slice(0, 600)));

  if (!offtopic.length) { console.log("[offtopic] Alakasız makale yok."); await prisma.$disconnect(); return; }
  console.log(`[offtopic] ${offtopic.length} alakasız makale:`);
  for (const a of offtopic) console.log(`  - ${a.title}`);
  if (apply) {
    for (const a of offtopic) await prisma.article.delete({ where: { id: a.id } });
    console.log(`[offtopic] ${offtopic.length} makale SİLİNDİ.`);
  } else {
    console.log("[offtopic] (kuru çalışma — silmek için --apply)");
  }
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
