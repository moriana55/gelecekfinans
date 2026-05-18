import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

function slugify(title: string): string {
  return title.toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80);
}

async function main() {
  const OUTPUT_DIR = path.join(process.env.HOME || "", "gelecekfinans-bot", "output");
  if (!fs.existsSync(OUTPUT_DIR)) {
    console.log("Output dizini bulunamadı:", OUTPUT_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith(".json")).sort().reverse();
  console.log(`${files.length} JSON dosyası bulundu.`);

  let added = 0, skipped = 0;

  for (const file of files) {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, file), "utf8"));
      if (!raw.title || !raw.content) { skipped++; continue; }

      const slug = slugify(raw.title);
      const existing = await prisma.article.findUnique({ where: { slug } });
      if (existing) { skipped++; continue; }

      await prisma.article.create({
        data: {
          title: raw.title,
          slug,
          meta: raw.meta || raw.title,
          keyword: raw.keyword || null,
          category: raw.category || "ekonomi",
          content: raw.content,
          imageUrl: raw.image_path || null,
          source: raw.source || null,
          articleSource: "BOT",
          status: "PUBLISHED",
          seoScore: null,
          publishedAt: new Date(raw.created_at || Date.now()),
          createdAt: new Date(raw.created_at || Date.now()),
        },
      });
      added++;
    } catch (e) {
      console.error(`Hata [${file}]:`, (e as Error).message);
      skipped++;
    }
  }

  console.log(`\nTamamlandı: ${added} eklendi, ${skipped} atlandı.`);
}

main().then(() => prisma.$disconnect());
