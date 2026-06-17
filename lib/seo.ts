interface SeoResult {
  score: number;
  issues: string[];
  passed: string[];
}

/** Yayın için önerilen minimum SEO skoru. Bu skorun altındakiler admin'de işaretlenir. */
export const SEO_PUBLISH_THRESHOLD = 60;

/** Skoru kategorize eder: ok (yeşil), warn (sarı), low (kırmızı). */
export function seoLevel(score: number | null | undefined): "ok" | "warn" | "low" {
  const s = score ?? 0;
  if (s >= 70) return "ok";
  if (s >= SEO_PUBLISH_THRESHOLD) return "warn";
  return "low";
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
  const text = article.content.replace(/<[^>]*>/g, "");
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const kw = (article.keyword || "").toLowerCase();

  // Title length (50-65 ideal)
  if (article.title.length < 30) {
    issues.push(`Başlık çok kısa (${article.title.length} karakter, min 30)`);
    score -= 12;
  } else if (article.title.length > 70) {
    issues.push(`Başlık çok uzun (${article.title.length} karakter, max 70)`);
    score -= 8;
  } else {
    passed.push(`Başlık uzunluğu ideal (${article.title.length})`);
  }

  // Meta description (120-160)
  if (!article.meta || article.meta.length < 80) {
    issues.push(`Meta açıklama çok kısa (${article.meta?.length || 0} karakter, min 80)`);
    score -= 12;
  } else if (article.meta.length > 165) {
    issues.push(`Meta açıklama çok uzun (${article.meta.length} karakter, max 165)`);
    score -= 5;
  } else {
    passed.push(`Meta açıklama uzunluğu ideal (${article.meta.length})`);
  }

  // Keyword
  if (!kw) {
    issues.push("Anahtar kelime tanımlı değil");
    score -= 8;
  } else {
    if (!article.title.toLowerCase().includes(kw)) {
      issues.push("Anahtar kelime başlıkta yok");
      score -= 8;
    } else {
      passed.push("Anahtar kelime başlıkta mevcut");
    }
    if (!article.meta.toLowerCase().includes(kw)) {
      issues.push("Anahtar kelime meta açıklamada yok");
      score -= 5;
    } else {
      passed.push("Anahtar kelime meta açıklamada");
    }

    // Keyword in first paragraph
    const firstP = article.content.match(/<p[^>]*>(.*?)<\/p>/i);
    if (firstP && !firstP[1].replace(/<[^>]*>/g, "").toLowerCase().includes(kw)) {
      issues.push("Anahtar kelime ilk paragrafta yok");
      score -= 5;
    } else if (firstP) {
      passed.push("Anahtar kelime ilk paragrafta mevcut");
    }

    // Keyword density (0.5% - 2.5%)
    if (wordCount > 50) {
      const kwWords = kw.split(/\s+/).length;
      const regex = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      const kwOccurrences = (text.toLowerCase().match(regex) || []).length;
      const density = (kwOccurrences * kwWords / wordCount) * 100;
      if (density < 0.5) {
        issues.push(`Anahtar kelime yoğunluğu düşük (${density.toFixed(1)}%, min 0.5%)`);
        score -= 5;
      } else if (density > 2.5) {
        issues.push(`Anahtar kelime yoğunluğu fazla (${density.toFixed(1)}%, max 2.5%)`);
        score -= 5;
      } else {
        passed.push(`Anahtar kelime yoğunluğu uygun (${density.toFixed(1)}%)`);
      }
    }
  }

  // Content length
  if (wordCount < 150) {
    issues.push(`İçerik çok kısa (${wordCount} kelime, min 150)`);
    score -= 15;
  } else if (wordCount < 300) {
    issues.push(`İçerik kısa (${wordCount} kelime, 300+ önerilir)`);
    score -= 7;
  } else {
    passed.push(`İçerik uzunluğu yeterli (${wordCount} kelime)`);
  }

  // Slug
  if (article.slug.length > 80) {
    issues.push("Slug çok uzun (max 80 karakter)");
    score -= 4;
  } else {
    passed.push("Slug uzunluğu uygun");
  }

  // H2 headings
  const h2Count = (article.content.match(/<h2/gi) || []).length;
  if (h2Count === 0) {
    issues.push("İçerikte alt başlık (H2) yok");
    score -= 8;
  } else {
    passed.push(`${h2Count} adet H2 başlık mevcut`);
  }

  // H3 headings (bonus structure)
  const h3Count = (article.content.match(/<h3/gi) || []).length;
  if (h2Count > 0 && h3Count === 0 && wordCount > 500) {
    issues.push("Uzun içerikte H3 alt başlık yok");
    score -= 3;
  } else if (h3Count > 0) {
    passed.push(`${h3Count} adet H3 başlık mevcut`);
  }

  // Internal links
  const internalLinks = (article.content.match(/href=["']\/[^"']*["']/gi) || []).length;
  if (internalLinks === 0) {
    issues.push("İç link (site içi bağlantı) yok");
    score -= 8;
  } else {
    passed.push(`${internalLinks} adet iç link mevcut`);
  }

  // External links
  const externalLinks = (article.content.match(/href=["']https?:\/\/[^"']*["']/gi) || []).length;
  if (externalLinks === 0) {
    issues.push("Dış link (harici kaynak bağlantısı) yok");
    score -= 5;
  } else {
    passed.push(`${externalLinks} adet dış link mevcut`);
  }

  // Images
  const imgCount = (article.content.match(/<img/gi) || []).length;
  if (imgCount === 0 && wordCount > 200) {
    issues.push("İçerikte görsel yok");
    score -= 5;
  } else if (imgCount > 0) {
    const imgWithoutAlt = (article.content.match(/<img(?![^>]*alt=["'][^"']+["'])[^>]*>/gi) || []).length;
    if (imgWithoutAlt > 0) {
      issues.push(`${imgWithoutAlt} görselde alt text eksik`);
      score -= 4;
    } else {
      passed.push("Tüm görsellerde alt text mevcut");
    }
  }

  // Paragraph structure
  const paragraphs = (article.content.match(/<p[^>]*>/gi) || []).length;
  if (paragraphs < 3 && wordCount > 200) {
    issues.push("Paragraf sayısı az, okunabilirlik düşük");
    score -= 4;
  }

  // Lists (bonus for readability)
  const hasList = /<[ou]l/i.test(article.content);
  if (hasList) {
    passed.push("Liste kullanımı mevcut (okunabilirlik +)");
  }

  return { score: Math.max(0, Math.min(100, score)), issues, passed };
}
