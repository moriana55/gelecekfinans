const QUERY_MAP: Record<string, string[]> = {
  kripto: ["cryptocurrency abstract premium", "bitcoin luxury", "digital gold technology", "blockchain secure background", "crypto world cinematic"],
  borsa: ["stock market professional", "wall street skyscraper cinematic", "trading desk professional", "financial district architecture", "bull market bronze"],
  doviz: ["international currency bills premium", "global finance abstract", "money bills clean", "bank interior modern", "wealth concept luxury"],
  altin: ["gold bars luxury", "pure gold coins premium", "precious metals minimalist", "investment gold cinematic", "gold texture rich"],
  ekonomi: ["modern city architecture", "central bank building premium", "corporate office minimalist", "global trade logistic", "macroeconomics abstract"],
};

export async function fetchUnsplashImage(keyword: string, category: string): Promise<string | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return null;

  const pool = QUERY_MAP[category] || QUERY_MAP.ekonomi;
  const baseQuery = pool[Math.floor(Math.random() * pool.length)];
  const query = keyword ? `professional ${baseQuery} ${keyword} clean minimalist` : `professional ${baseQuery} clean minimalist`;

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=10&orientation=landscape&content_filter=high&order_by=relevant`,
      {
        headers: { Authorization: `Client-ID ${key}` },
        signal: AbortSignal.timeout(8000),
      }
    );
    const data = await res.json();
    const results = data.results || [];
    if (results.length === 0) return null;

    const top = results.slice(0, 5);
    const pick = top[Math.floor(Math.random() * top.length)];
    return pick.urls?.regular || null;
  } catch {
    return null;
  }
}
