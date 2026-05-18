import { getAllArticles } from "@/lib/articles";

const BASE = "https://gelecekfinans.com";

export async function GET() {
  const articles = (await getAllArticles()).slice(0, 50);
  const items = articles
    .map(
      (a) => `<item>
      <title><![CDATA[${a.title}]]></title>
      <link>${BASE}/${a.slug}</link>
      <description><![CDATA[${a.meta}]]></description>
      <pubDate>${new Date(a.created_at).toUTCString()}</pubDate>
      <category>${a.category}</category>
      <guid>${BASE}/${a.slug}</guid>
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>GelecekFinans</title>
    <link>${BASE}</link>
    <description>Borsa, döviz, kripto para, altın ve ekonomi alanında güncel haberler.</description>
    <language>tr</language>
    <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=600",
    },
  });
}
