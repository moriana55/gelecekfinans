interface SeoResult {
  score: number;
  issues: string[];
  passed: string[];
}

export function analyzeSeo(article: {
  title: string;
  meta: string;
  keyword?: string | null;
  content: string;
  slug: string;
}): SeoResult {
  const issues: string[] = [];
  const passed: string[] = [];
  let score = 100;

  // Title length (50-65 ideal)
  if (article.title.length < 30) {
    issues.push(`Başlık çok kısa (${article.title.length} karakter, min 30)`);
    score -= 15;
  } else if (article.title.length > 70) {
    issues.push(`Başlık çok uzun (${article.title.length} karakter, max 70)`);
    score -= 10;
  } else {
    passed.push(`Başlık uzunluğu ideal (${article.title.length})`);
  }

  // Meta description (120-160)
  if (!article.meta || article.meta.length < 80) {
    issues.push(`Meta açıklama çok kısa (${article.meta?.length || 0} karakter, min 80)`);
    score -= 15;
  } else if (article.meta.length > 165) {
    issues.push(`Meta açıklama çok uzun (${article.meta.length} karakter, max 165)`);
    score -= 5;
  } else {
    passed.push(`Meta açıklama uzunluğu ideal (${article.meta.length})`);
  }

  // Keyword presence
  if (!article.keyword) {
    issues.push("Anahtar kelime tanımlı değil");
    score -= 10;
  } else {
    const kw = article.keyword.toLowerCase();
    if (!article.title.toLowerCase().includes(kw)) {
      issues.push("Anahtar kelime başlıkta yok");
      score -= 10;
    } else {
      passed.push("Anahtar kelime başlıkta mevcut");
    }
    if (!article.meta.toLowerCase().includes(kw)) {
      issues.push("Anahtar kelime meta açıklamada yok");
      score -= 5;
    } else {
      passed.push("Anahtar kelime meta açıklamada mevcut");
    }
  }

  // Content length
  const wordCount = article.content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  if (wordCount < 200) {
    issues.push(`İçerik çok kısa (${wordCount} kelime, min 200)`);
    score -= 20;
  } else if (wordCount < 400) {
    issues.push(`İçerik kısa (${wordCount} kelime, 400+ önerilir)`);
    score -= 5;
  } else {
    passed.push(`İçerik uzunluğu yeterli (${wordCount} kelime)`);
  }

  // Slug check
  if (article.slug.length > 80) {
    issues.push("Slug çok uzun (max 80 karakter)");
    score -= 5;
  } else {
    passed.push("Slug uzunluğu uygun");
  }

  // H2 headings in content
  const h2Count = (article.content.match(/<h2/g) || []).length;
  if (h2Count === 0) {
    issues.push("İçerikte alt başlık (H2) yok");
    score -= 10;
  } else {
    passed.push(`${h2Count} adet H2 başlık mevcut`);
  }

  return { score: Math.max(0, score), issues, passed };
}
