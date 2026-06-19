import { prisma } from "@/lib/db";

interface LinkableArticle {
  slug: string;
  title: string;
  category: string;
  keyword: string | null;
}

export async function autoLink(
  content: string,
  category: string,
  currentSlug: string
): Promise<string> {
  const candidates = await prisma.article.findMany({
    where: { status: "PUBLISHED", slug: { not: currentSlug } },
    select: { slug: true, title: true, category: true, keyword: true },
    orderBy: { publishedAt: "desc" },
    take: 100,
  });

  let html = content;

  // Replace [DAHILI_LINK] placeholders with relevant internal links
  const sameCat = candidates.filter(a => a.category === category);
  const otherCat = candidates.filter(a => a.category !== category);
  const pool = [...sameCat, ...otherCat];

  let placeholderIdx = 0;
  html = html.replace(/\[DAHILI_LINK\]/gi, () => {
    const target = pool[placeholderIdx % pool.length];
    if (!target) return "";
    placeholderIdx++;
    return `<a href="/${target.slug}">${target.title}</a>`;
  });

  // Also inject contextual internal links by matching keywords in content
  const internalLinksAdded = countInternalLinks(html);
  if (internalLinksAdded < 2 && pool.length > 0) {
    html = injectKeywordLinks(html, pool, currentSlug, 3 - internalLinksAdded);
  }

  return html;
}

function countInternalLinks(html: string): number {
  return (html.match(/href=["']\/[^"']*["']/gi) || []).length;
}

function injectKeywordLinks(
  html: string,
  articles: LinkableArticle[],
  currentSlug: string,
  maxLinks: number
): string {
  let added = 0;

  for (const article of articles) {
    if (added >= maxLinks) break;
    if (article.slug === currentSlug) continue;

    const terms = [
      article.keyword,
      ...article.title.split(/[\s:,—–-]+/).filter(w => w.length > 4),
    ].filter(Boolean) as string[];

    for (const term of terms) {
      if (added >= maxLinks) break;
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      // Only match text NOT already inside an <a> tag
      const regex = new RegExp(
        `(?<![/"'>])\\b(${escaped})\\b(?![^<]*<\\/a>)`,
        "i"
      );
      const match = html.match(regex);
      if (match && match.index !== undefined) {
        const before = html.slice(0, match.index);
        const after = html.slice(match.index + match[0].length);
        // Don't link inside headings
        const lastTag = before.lastIndexOf("<");
        const tagSnippet = before.slice(lastTag).toLowerCase();
        if (tagSnippet.startsWith("<h2") || tagSnippet.startsWith("<h3")) continue;

        html = `${before}<a href="/${article.slug}">${match[0]}</a>${after}`;
        added++;
        break;
      }
    }
  }

  return html;
}
