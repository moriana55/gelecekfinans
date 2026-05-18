import { getAllArticles } from "@/lib/articles";
import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

const BASE = "https://gelecekfinans.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getAllArticles();
  const articleEntries = articles.map((a) => ({
    url: `${BASE}/${a.slug}`,
    lastModified: new Date(a.created_at),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const categories = ["kripto", "borsa", "doviz", "altin", "ekonomi"];
  const catEntries = categories.map((c) => ({
    url: `${BASE}/kategori/${c}`,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [
    { url: BASE, changeFrequency: "hourly", priority: 1 },
    { url: `${BASE}/hakkimizda`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/iletisim`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/gizlilik-politikasi`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/kullanim-kosullari`, changeFrequency: "yearly", priority: 0.2 },
    ...catEntries,
    ...articleEntries,
  ];
}
