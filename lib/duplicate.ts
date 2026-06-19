function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-zçğıöşü0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

function bigrams(text: string): Set<string> {
  const words = normalize(text).split(" ");
  const set = new Set<string>();
  for (let i = 0; i < words.length - 1; i++) {
    set.add(words[i] + " " + words[i + 1]);
  }
  return set;
}

export function similarity(a: string, b: string): number {
  const setA = bigrams(a);
  const setB = bigrams(b);
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const bg of setA) {
    if (setB.has(bg)) intersection++;
  }
  return (2 * intersection) / (setA.size + setB.size);
}

// ── Türkçe stopword'ler (anlam taşımayan bağlaç/edat/ek sözcükler). Token
// örtüşmesi hesaplanırken çıkarılır; böylece "Rusya/Merkez/Bankası/Faiz" gibi
// çekirdek varlıklar öne çıkar, "ve/ile/için" gibi dolgu kelimeler şişirmez.
const STOPWORDS = new Set([
  "ve", "ile", "için", "de", "da", "ki", "mi", "mı", "mu", "mü",
  "bir", "bu", "şu", "o", "the", "a", "an", "of", "to", "in", "on",
  "ama", "fakat", "ancak", "veya", "ya", "yada", "hem", "ne",
  "daha", "çok", "az", "en", "gibi", "kadar", "göre", "sonra", "önce",
  "olarak", "oldu", "olan", "ise", "her", "bütün", "tüm", "yine",
  "üzerinde", "üzerine", "karşı", "doğru", "altında", "üstünde",
]);

// Başlığı anlamlı token kümesine çevirir (normalize + stopword + kısa token at).
function meaningfulTokens(text: string): Set<string> {
  return new Set(
    normalize(text)
      .split(" ")
      .filter((w) => w.length >= 3 && !STOPWORDS.has(w)),
  );
}

/**
 * İki başlık arasındaki anlamlı token örtüşmesini ölçer.
 * Döner: { overlap: ortak anlamlı kelime sayısı, jaccard: Jaccard benzerliği }.
 */
function titleTokenOverlap(a: string, b: string): { overlap: number; jaccard: number } {
  const setA = meaningfulTokens(a);
  const setB = meaningfulTokens(b);
  if (setA.size === 0 || setB.size === 0) return { overlap: 0, jaccard: 0 };
  let overlap = 0;
  for (const t of setA) if (setB.has(t)) overlap++;
  const union = new Set([...setA, ...setB]).size;
  return { overlap, jaccard: union === 0 ? 0 : overlap / union };
}

export function isDuplicate(
  newTitle: string,
  newContent: string,
  existingArticles: { title: string; content: string; id: string }[]
): { duplicate: boolean; matchId?: string; score: number } {
  for (const existing of existingArticles) {
    // 1) Bigram benzerliği (eski yöntem, kelime sırasına duyarlı) — yüksek
    //    örtüşmede güvenli sinyal.
    const titleSim = similarity(newTitle, existing.title);
    if (titleSim > 0.8) return { duplicate: true, matchId: existing.id, score: titleSim };

    // 2) Anlamlı token örtüşmesi (sıralamadan bağımsız). Aynı olayı farklı
    //    cümleyle anlatan başlıkları yakalar:
    //    "Rusya Merkez Bankası Faiz İndirimine Gitti" vs
    //    "Rusya Merkez Bankası Faiz Oranını Beklentilerin Altında İndirdi"
    //    → ortak: rusya, merkez, bankası, faiz (4 token).
    //    Eşik (dengeli, fazla agresif değil):
    //      • 3+ ortak anlamlı kelime  VEYA
    //      • Jaccard ≥ 0.60 (token kümelerinin %60+ örtüşmesi)
    //    "3 ortak kelime" eşiği, kısa başlıklarda tek ortak konunun (ör. sadece
    //    "Merkez Bankası") yanlış eşleşmesini önler; 3+ varlık çakışması gerçek
    //    bir aynı-olay sinyalidir.
    const { overlap, jaccard } = titleTokenOverlap(newTitle, existing.title);
    if (overlap >= 3 || jaccard >= 0.6) {
      return { duplicate: true, matchId: existing.id, score: Math.max(jaccard, titleSim) };
    }

    // 3) İçerik baş kısmı benzerliği (gövde kopyası/çok yakın yeniden yazım).
    const contentSim = similarity(
      newContent.slice(0, 500),
      existing.content.slice(0, 500)
    );
    if (contentSim > 0.7) return { duplicate: true, matchId: existing.id, score: contentSim };
  }
  return { duplicate: false, score: 0 };
}
