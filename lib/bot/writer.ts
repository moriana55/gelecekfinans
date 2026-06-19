import OpenAI from "openai";
import { CATEGORY_PROMPTS, ARTICLE_WORDS, ARTICLE_MIN_WORDS } from "./config";
import type { Topic } from "./topics";
import { XMLParser } from "fast-xml-parser";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let _cachedPrices: { data: string; ts: number } | null = null;

async function getLivePrices(): Promise<string> {
  if (_cachedPrices && Date.now() - _cachedPrices.ts < 10 * 60 * 1000) return _cachedPrices.data;
  try {
    const [tcmbRes, btcRes] = await Promise.all([
      fetch("https://www.tcmb.gov.tr/kurlar/today.xml").then(r => r.text()),
      fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd,try").then(r => r.json()),
    ]);
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
    const xml = parser.parse(tcmbRes);
    const kurlar = xml?.Tarih_Date?.Currency || [];
    const find = (code: string) => {
      const k = kurlar.find((c: Record<string, string>) => c["@_CurrencyCode"] === code);
      return k ? parseFloat(k.ForexSelling) : null;
    };
    const usd = find("USD");
    const eur = find("EUR");
    const btcUsd = btcRes?.bitcoin?.usd;
    const btcTry = btcRes?.bitcoin?.try;
    const ethUsd = btcRes?.ethereum?.usd;
    let goldOzUsd = 2400;
    try {
      const goldRes = await fetch("https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1d&range=1d");
      const goldData = await goldRes.json();
      const goldPrice = goldData?.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (goldPrice) goldOzUsd = goldPrice;
    } catch {}
    const goldGramTry = usd ? Math.round((goldOzUsd / 31.1035) * usd) : null;

    const lines = [
      `Tarih: ${new Date().toLocaleDateString("tr-TR")}`,
      usd ? `Dolar/TL: ${usd.toFixed(2)}` : null,
      eur ? `Euro/TL: ${eur.toFixed(2)}` : null,
      btcUsd ? `Bitcoin: $${btcUsd.toLocaleString("en-US")} (₺${Math.round(btcTry).toLocaleString("tr-TR")})` : null,
      ethUsd ? `Ethereum: $${ethUsd.toLocaleString("en-US")}` : null,
      goldGramTry ? `Gram Altın (yaklaşık): ₺${goldGramTry.toLocaleString("tr-TR")}` : null,
    ].filter(Boolean);
    const txt = lines.join("\n");
    _cachedPrices = { data: txt, ts: Date.now() };
    return txt;
  } catch {
    return "Güncel fiyat verisi alınamadı.";
  }
}

function countWords(text: string): number {
  return text.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
}

async function buildPrompt(topic: Topic, targetWords: number): Promise<string> {
  const prices = await getLivePrices();
  const struct = CATEGORY_PROMPTS[topic.category]?.structure || "";

  return `HABERİ YAZ — Konu: ${topic.title}
Kaynak özet: ${topic.summary}
Kategori: ${topic.category}
Hedef uzunluk: EN AZ ${targetWords} kelime

⚠️ ÖNEMLİ: Bu bir HABER yazısıdır, ANALİZ DEĞİL. Piyasa analizi, teknik görünüm, destek/direnç YAZMA.
Haberin odağı: KİM NE DEDİ, NE KARAR ALDI, NE AÇIKLADI — somut olay ve gelişmeleri yaz.

GÜNCEL PİYASA VERİLERİ (referans olarak kullan, haberin ana konusu yapma):
${prices}
Kur/fiyat yazarken MUTLAKA yukarıdaki güncel verileri kullan, kafandan uydurma.
${struct ? `
BÖLÜM YAPISI (${topic.category} kategorisine özel — ## (H2) başlıklarını bu akışa göre kur):
${struct}
` : ""}
HABER FORMATI:
1. SEO başlığı (55-62 karakter) — "X şunu açıkladı", "Y kararı alındı" gibi haber başlığı
2. Meta description (150-160 karakter, focus keyword içersin)
3. Focus keyword (1-3 kelime)
4. Haber içeriği:
   - İlk paragraf: Haberin özeti (ne oldu, kim açıkladı, ne zaman)
   - Detaylar: Kararın/gelişmenin arka planı ve önemi
   - Türkiye etkisi: Bu gelişme Türkiye'yi nasıl etkiler
   - Uzman/yetkili görüşleri veya resmi açıklamalar
   - Geçmişle karşılaştırma: Daha önce benzer durumda ne olmuştu

SEO KURALLARI:
- En az 4 tane ## (H2) başlığı kullan
- Focus keyword'ü ilk paragrafta ve meta description'da kullan
- Makale içine madde listesi ekle
- Sonuna 2 soruluk FAQ ekle (## Sıkça Sorulan Sorular)

DIŞ LİNK (ZORUNLU — en az 1 tane):
- Gerçek URL kullan, placeholder YAZMA. Örnekler:
  * [TCMB](https://www.tcmb.gov.tr)
  * [TÜİK](https://www.tuik.gov.tr)
  * [Bloomberg](https://www.bloomberg.com)
  * [Reuters](https://www.reuters.com)
- Format: [Görünen Metin](https://gercek-url.com)

İÇ LİNK: Uygun bir yere "[DAHILI_LINK]" yerleştir.

YASAKLAR:
- Piyasa analizi, teknik analiz, destek/direnç, fiyat hedefi YAZMA
- Yatırım tavsiyesi verme, al-sat sinyali verme
- Kaynak metni kopyalama, özgün yaz
- Sonuna disclaimer ekle

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
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="nofollow noopener noreferrer">$1</a>')
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

  const system = `Sen gelecekfinans.com için Türkçe finans HABERLERİ yazan deneyimli bir ekonomi muhabirisin.

YAZIM TARZI:
- Gazetecilik diliyle yaz — haber formatında, objektif, bilgilendirici
- İlk paragrafta haberin özünü ver (5N1K: Ne oldu, kim açıkladı, ne zaman, neden önemli)
- Haberi derinleştir: arka plan, bağlam, uzman/yetkili görüşleri, geçmişle karşılaştırma
- H2 başlıkları kullan (## ile), en az 3 H2 bölümü olsun
- ÖZGÜN İÇERİK: Kaynak metinlerden cümle kopyalama, haberi kendi cümlelerinle yaz

HABER ODAĞI:
- Kim ne dedi, ne karar aldı, ne açıkladı — SOMUT OLAYLAR yaz
- "TCMB faizi sabit tuttu", "Ekonomi Bakanı X ile görüştü", "Enflasyon %X açıklandı" gibi GERÇEK haberler
- Soyut piyasa analizi YAPMA. "Dolar/TL'nin teknik görünümü" gibi analiz yazıları YAZMA.
- Her haberde konunun Türkiye ekonomisine etkisini açıkla

⛔ YASAKLAR (KESİNLİKLE UYULMASI GEREKEN):
- ASLA yatırım tavsiyesi verme, fiyat hedefi verme, al-sat sinyali verme
- ASLA destek/direnç seviyesi, teknik analiz, fiyat tahmini yazma
- ASLA "yükselecek", "düşecek" gibi kesin tahmin yapma
- "Teknik seviyeler", "teknik görünüm", "teknik analiz" başlığı AÇMA
- Piyasa verilerini sadece MEVCUT DURUM olarak aktar, gelecek tahmini yapma
- Her yazının sonuna disclaimer ekle: "Bu içerik yalnızca bilgilendirme amaçlıdır, yatırım tavsiyesi değildir."
${catExtra}`;

  let article: ReturnType<typeof parseResponse> & { wordCount: number } = null!;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const wordsAsk = targetWords + attempt * 250;

    let response;
    try {
      response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: system },
          { role: "user", content: await buildPrompt(topic, wordsAsk) },
        ],
        max_tokens: Math.min(6000, wordsAsk * 3),
        temperature: 0.7,
      });
    } catch (e: unknown) {
      const err = e as { status?: number; message?: string };
      if (err.status === 429 || err.status === 503) {
        await new Promise(r => setTimeout(r, 5000));
        response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: system },
            { role: "user", content: await buildPrompt(topic, wordsAsk) },
          ],
          max_tokens: Math.min(6000, wordsAsk * 3),
          temperature: 0.7,
        });
      } else {
        throw new Error(`OpenAI: ${err.status || "?"} — ${err.message || String(e)}`);
      }
    }

    const raw = response.choices[0].message.content?.trim() || "";
    const parsed = parseResponse(raw, topic);
    const wc = countWords(parsed.content);
    article = { ...parsed, wordCount: wc };

    if (wc >= ARTICLE_MIN_WORDS) return article;
  }

  return article;
}
