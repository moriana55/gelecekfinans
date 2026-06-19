import Parser from "rss-parser";
import { RSS_FEEDS, CATEGORIES } from "./config";

export interface Topic {
  title: string;
  summary: string;
  category: string;
  source: string;
  imageUrl?: string;
}

const parser = new Parser({ timeout: 8000 });

function extractImageFromContent(html: string): string | undefined {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1];
}

export async function getTopics(limit = 20, category?: string): Promise<Topic[]> {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const topics: Topic[] = [];

  const results = await Promise.allSettled(
    RSS_FEEDS.map(async (url) => {
      const feed = await parser.parseURL(url);
      for (const entry of (feed.items || []).slice(0, 15)) {
        const title = (entry.title || "").trim();
        if (!title) continue;

        const pubDate = entry.pubDate ? new Date(entry.pubDate).getTime() : 0;
        if (pubDate && pubDate < cutoff) continue;

        const summary = (entry.contentSnippet || entry.content || "").slice(0, 300);

        const e = entry as Record<string, unknown>;
        const enclosure = e.enclosure as Record<string, string> | undefined;
        const media = e["media:content"] as Record<string, Record<string, string>> | undefined;
        const imageUrl =
          enclosure?.url ||
          media?.["$"]?.url ||
          extractImageFromContent(entry.content || "") ||
          undefined;

        const text = (title + " " + summary).toLowerCase();

        let cat = "ekonomi";
        for (const [c, keywords] of Object.entries(CATEGORIES)) {
          if (keywords.some((kw) => text.includes(kw))) {
            cat = c;
            break;
          }
        }

        topics.push({
          title,
          summary,
          category: cat,
          source: feed.title || url,
          imageUrl,
        });
      }
    })
  );

  const errors = results.filter((r) => r.status === "rejected").length;
  if (errors > 0) console.log(`[topics] ${errors} RSS feed hata verdi`);

  const filtered = category && category !== "otomatik"
    ? topics.filter((t) => t.category === category)
    : topics;

  const seen = new Set<string>();
  const unique: Topic[] = [];
  for (const t of filtered) {
    const key = t.title.slice(0, 40).toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(t);
    }
  }

  return unique.slice(0, limit);
}
