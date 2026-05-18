import OpenAI from "openai";
import { CATEGORY_PROMPTS, ARTICLE_WORDS, ARTICLE_MIN_WORDS } from "./config";
import type { Topic } from "./topics";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function countWords(text: string): number {
  return text.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
}

function buildPrompt(topic: Topic, targetWords: number): string {
  const extra = CATEGORY_PROMPTS[topic.category] || {};
  const struct = extra.structure || "Mevcut Durum → Analiz → Türkiye Etkisi → Öngörü";

  return `Konu ilhamı: ${topic.title}
Arka plan: ${topic.summary}
Kategori: ${topic.category}
Hedef uzunluk: EN AZ ${targetWords} kelime (Dolu dolu ve detaylı yaz)
Yazı yapısı: ${struct}

Şunu üret:
1. SEO başlığı (55-62 karakter, anahtar kelime içersin)
2. Meta description (150-160 karakter arası, merak uyandırıcı)
3. Focus keyword (1-3 kelime)
4. Makale içeriği (HTML yapısında H2 başlıkları ## ile, paragraflar)

SEO 80+ PUAN KURALLARI (ZORUNLU):
- En az 4 tane ## (H2) başlığı kullan.
- Focus keyword'ü İLK PARAGRAFIN İLK CÜMLESİNDE mutlaka geçir.
- Focus keyword'ü makale boyunca en az 5-6 kez doğal bir şekilde kullan.
- Makale içine mutlaka bir adet MADDELEYEREK LİSTELEME (bullet points) bölümü ekle.
- Makalenin sonuna mutlaka 2 soruluk bir "Sıkça Sorulan Sorular" (FAQ) bölümü ekle (## Sıkça Sorulan Sorular).
- Makale içine en az 1 tane otorite kaynağa atıfta bulunarak DIŞ LİNK ekle.

LİNKLEME KURALLARI:
- Makale içinde uygun bir yere şu ifadeyi yerleştir: "[DAHILI_LINK]"

ÖNEMLİ — ÖZGÜNLÜK & GÜVENLİK:
- ASLA kaynak metni kopyalama. Tamamen özgün ve derinlikli bir finansal analiz yaz.
- SPK UYUMU: Kesinlikle yatırım tavsiyesi verme. Mesafeli ve bilgilendirici dil kullan.
- Disclaimer'ı en sona eklemeyi unutma.

Format:
BASLIK: ...
META: ...
KEYWORD: ...
ICERIK:
[makale buraya]`;
}

function mdToHtml(text: string): string {
  const lines = text.split("\n");
  const out: string[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (line.startsWith("## ")) {
      out.push(`<h2>${inline(line.slice(3).trim())}</h2>`);
    } else if (line.startsWith("### ")) {
      out.push(`<h3>${inline(line.slice(4).trim())}</h3>`);
    } else if (line.startsWith("- ")) {
      out.push(`<li>${inline(line.slice(2).trim())}</li>`);
    } else {
      out.push(`<p>${inline(line)}</p>`);
    }
  }

  const final: string[] = [];
  let inList = false;
  for (const item of out) {
    if (item.startsWith("<li>") && !inList) {
      final.push("<ul>");
      inList = true;
    } else if (!item.startsWith("<li>") && inList) {
      final.push("</ul>");
      inList = false;
    }
    final.push(item);
  }
  if (inList) final.push("</ul>");

  return final.join("\n");
}

function inline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

function parseResponse(raw: string, topic: Topic) {
  const lines = raw.split("\n");
  let title = topic.title;
  let meta = "";
  let keyword = "";
  const contentLines: string[] = [];
  let inContent = false;

  for (const line of lines) {
    if (line.startsWith("BASLIK:")) {
      title = line.replace("BASLIK:", "").trim();
    } else if (line.startsWith("META:")) {
      meta = line.replace("META:", "").trim();
    } else if (line.startsWith("KEYWORD:")) {
      keyword = line.replace("KEYWORD:", "").trim();
    } else if (line.startsWith("ICERIK:")) {
      inContent = true;
    } else if (inContent) {
      contentLines.push(line);
    }
  }

  const content = mdToHtml(contentLines.join("\n").trim());

  return { title, meta, keyword, content, category: topic.category, source: topic.source };
}

export async function writeArticle(
  topic: Topic,
  targetWords = ARTICLE_WORDS,
  maxRetries = 3
): Promise<{
  title: string; meta: string; keyword: string; content: string;
  category: string; source: string; wordCount: number;
}> {
  const catExtra = CATEGORY_PROMPTS[topic.category]?.system_extra || "";

  const system = `Sen gelecekfinans.com için Türkçe SEO odaklı finans makaleleri yazan uzman bir finansal gazeteci ve analistsin.
- Türkçe yaz, resmi ama akıcı ve anlaşılır dil kullan
- H2 başlıkları kullan (## ile), en az 3 H2 bölümü olsun
- İlk paragraf konuyu özgün bir çerçevelemeyle sun
- Spesifik rakam, oran ve tarih kullan; bu verileri yorumla
- Clickbait değil, derinlikli ve analitik ol
- ÖZGÜN İÇERİK: Kaynak metinlerden hiçbir cümle veya ifade kopyalama
- Türkiye finans piyasasına özgü perspektif ve yerel bağlam ekle
- SPK UYUMLULUĞU: Yatırım tavsiyesi verme, fiyat hedefi belirtme. Nesnel, mesafeli ve bilgilendirici dil kullan. Her yazının sonuna disclaimer paragrafı ekle.
${catExtra}`;

  let article: ReturnType<typeof parseResponse> & { wordCount: number } = null!;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const wordsAsk = targetWords + attempt * 250;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: system },
        { role: "user", content: buildPrompt(topic, wordsAsk) },
      ],
      max_tokens: Math.min(6000, wordsAsk * 3),
      temperature: 0.7,
    });

    const raw = response.choices[0].message.content?.trim() || "";
    const parsed = parseResponse(raw, topic);
    const wc = countWords(parsed.content);
    article = { ...parsed, wordCount: wc };

    if (wc >= ARTICLE_MIN_WORDS) return article;
  }

  return article;
}
