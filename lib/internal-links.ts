import type { Article } from "./types";

export function injectInternalLinks(content: string, currentSlug: string, allArticles: Article[]): string {
  const candidates = allArticles
    .filter(a => a.slug !== currentSlug && a.keyword)
    .slice(0, 50);

  let result = content;
  let linksAdded = 0;
  const maxLinks = 3;

  for (const article of candidates) {
    if (linksAdded >= maxLinks) break;

    const keywords = (article.keyword || "").split(",").map(k => k.trim()).filter(k => k.length > 3);
    for (const kw of keywords) {
      if (linksAdded >= maxLinks) break;

      const regex = new RegExp(`(?<![<\\/a-zA-Z"=])\\b(${escapeRegex(kw)})\\b(?![^<]*<\\/a>)(?![^<]*>)`, "i");
      if (regex.test(result)) {
        result = result.replace(regex, `<a href="/${article.slug}" style="color:var(--accent);text-decoration:underline">$1</a>`);
        linksAdded++;
      }
    }
  }

  return result;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
