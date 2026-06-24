import { getAllArticles } from "@/lib/articles";
import { FX_PAIRS, GOLD_TYPES, CRYPTO_COINS } from "@/lib/market";
import type { MetadataRoute } from "next";

// Haber sitesi için saatlik tazeleme yeterli; her istekte tüm makaleleri
// çekmek yerine sitemap saatte bir yeniden üretilir (revalidate = 3600 sn).
export const revalidate = 3600;

const BASE = "https://gelecekfinans.com";

const TOOL_SLUGS = [
  "doviz-cevirici",
  "altin-hesaplama",
  "kredi-faiz-hesaplama",
  "mevduat-faiz-hesaplama",
  "enflasyon-hesaplama",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getAllArticles();
  const articleEntries = articles.map((a) => ({
    url: `${BASE}/${a.slug}`,
    lastModified: new Date(a.updatedAt || a.created_at),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const categories = ["kripto", "borsa", "doviz", "altin", "ekonomi"];
  const catEntries = categories.map((c) => ({
    url: `${BASE}/kategori/${c}`,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  // Canlı piyasa verisi sayfaları (yüksek arama hacmi)
  const marketHubs = ["/doviz", "/altin", "/kripto", "/faiz", "/araclar"].map((u) => ({
    url: `${BASE}${u}`,
    changeFrequency: "hourly" as const,
    priority: 0.9,
  }));
  const fxEntries = Object.keys(FX_PAIRS).map((p) => ({
    url: `${BASE}/doviz/${p}`,
    changeFrequency: "hourly" as const,
    priority: 0.85,
  }));
  const goldEntries = Object.keys(GOLD_TYPES).map((t) => ({
    url: `${BASE}/altin/${t}`,
    changeFrequency: "hourly" as const,
    priority: 0.85,
  }));
  const cryptoEntries = Object.keys(CRYPTO_COINS).map((c) => ({
    url: `${BASE}/kripto/${c}`,
    changeFrequency: "hourly" as const,
    priority: 0.85,
  }));
  const toolEntries = TOOL_SLUGS.map((s) => ({
    url: `${BASE}/araclar/${s}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    { url: BASE, changeFrequency: "hourly", priority: 1 },
    { url: `${BASE}/arsiv`, changeFrequency: "daily", priority: 0.6 },
    { url: `${BASE}/hakkimizda`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/iletisim`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/gizlilik-politikasi`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/kullanim-kosullari`, changeFrequency: "yearly", priority: 0.2 },
    ...marketHubs,
    ...fxEntries,
    ...goldEntries,
    ...cryptoEntries,
    ...toolEntries,
    ...catEntries,
    ...articleEntries,
  ];
}
