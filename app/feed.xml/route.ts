import { getAllArticles } from "@/lib/articles";

const BASE = "https://gelecekfinans.com";

const CATEGORY_TR: Record<string, string> = {
  kripto: "Kripto Para",
  borsa: "Borsa",
  doviz: "Döviz",
  altin: "Altın",
  ekonomi: "Ekonomi",
};

export async function GET() {
  const articles = (await getAllArticles()).slice(0, 50);
  const items = articles
    .map(
      (a) => `<item>
      <title><![CDATA[${a.title}]]></title>
      <link>${BASE}/${a.slug}</link>
      <description><![CDATA[${a.meta}]]></description>
      <pubDate>${new Date(a.created_at).toUTCString()}</pubDate>
      <category>${CATEGORY_TR[a.category] || a.category}</category>
      <guid isPermaLink="true">${BASE}/${a.slug}</guid>
      <source url="${BASE}/feed.xml">GelecekFinans</source>
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>GelecekFinans</title>
    <link>${BASE}</link>
    <description>Borsa, döviz, kripto para, altın ve ekonomi alanında güncel haberler ve analizler.</description>
    <language>tr</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${BASE}/icon.svg</url>
      <title>GelecekFinans</title>
      <link>${BASE}</link>
    </image>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=600",
    },
  });
}
