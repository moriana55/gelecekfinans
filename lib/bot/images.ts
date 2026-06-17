const QUERY_MAP: Record<string, string[]> = {
  kripto: [
    "bitcoin digital abstract neon",
    "cryptocurrency neon chart dark",
    "blockchain technology abstract",
    "crypto trading dark screen chart",
    "digital currency futuristic",
    "bitcoin ethereum neon glow",
  ],
  borsa: [
    "stock market chart candlestick dark",
    "trading screen multiple monitors",
    "stock exchange graph green red dark",
    "financial chart analysis dark",
    "bull bear market abstract",
    "investment portfolio chart screen",
  ],
  doviz: [
    "forex trading chart screen dark",
    "currency exchange rate board",
    "global finance world map",
    "dollar euro exchange digital",
    "foreign exchange market screen",
    "currency trading chart analysis",
  ],
  altin: [
    "gold bars dark background luxury",
    "gold bullion vault dark",
    "gold investment dark luxury",
    "gold bar close up dark",
    "precious metal gold dark",
    "gold reserve bank vault",
  ],
  ekonomi: [
    "economy growth chart abstract",
    "financial data analytics dark",
    "business finance chart dark screen",
    "economic data graph screen",
    "central bank building modern",
    "inflation economy abstract chart",
  ],
};

const FALLBACK_QUERIES = [
  "financial technology abstract dark",
  "fintech digital abstract",
  "business analytics dark screen",
];

export async function fetchUnsplashImage(keyword: string, category: string): Promise<string | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return null;

  const pool = QUERY_MAP[category] || QUERY_MAP.ekonomi;
  const query = pool[Math.floor(Math.random() * pool.length)];

  const result = await searchUnsplash(query, key);
  if (result) return result;

  const fallback = FALLBACK_QUERIES[Math.floor(Math.random() * FALLBACK_QUERIES.length)];
  return searchUnsplash(fallback, key);
}

async function searchUnsplash(query: string, key: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=20&orientation=landscape&content_filter=high&order_by=relevant`,
      {
        headers: { Authorization: `Client-ID ${key}` },
        signal: AbortSignal.timeout(8000),
      }
    );
    const data = await res.json();
    const results = (data.results || []).filter((r: Record<string, unknown>) => {
      const w = (r as { width?: number }).width || 0;
      const h = (r as { height?: number }).height || 0;
      return w > 800 && h > 400 && w / h > 1.2;
    });
    if (results.length === 0) return null;
    const pick = results[Math.floor(Math.random() * Math.min(8, results.length))];
    return (pick as { urls?: { regular?: string } }).urls?.regular || null;
  } catch {
    return null;
  }
}
