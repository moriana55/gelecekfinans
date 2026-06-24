import sanitizeHtml from "sanitize-html";

/**
 * Makale gövdesi (LLM/bot üretimi + admin içeriği) sayfada
 * dangerouslySetInnerHTML ile basılıyor. Stored-XSS'i önlemek için
 * basmadan ÖNCE buradan geçir: <script>/<iframe>/on* handler / javascript:
 * URI'leri temizlenir, sadece güvenli biçimlendirme + link/görsel kalır.
 */
const ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "hr", "blockquote", "pre", "code",
  "ul", "ol", "li",
  "strong", "b", "em", "i", "u", "s", "mark", "small", "sub", "sup",
  "a", "img", "figure", "figcaption",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td",
  "span", "div",
];

export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "title", "target", "rel", "class"],
      img: ["src", "alt", "title", "width", "height", "loading", "class"],
      "*": ["class", "id", "style"],
    },
    // style attribute'unda yalnızca zararsız birkaç özelliğe izin ver.
    allowedStyles: {
      "*": {
        "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/],
        color: [/^#[0-9a-fA-F]{3,8}$/, /^rgb\(/, /^[a-z]+$/],
      },
    },
    allowedSchemes: ["http", "https", "mailto"],
    // Tüm dış linklere güvenli rel + yeni sekme.
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href || "";
        const isExternal = /^https?:\/\//i.test(href);
        return {
          tagName: "a",
          attribs: {
            ...attribs,
            ...(isExternal ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {}),
          },
        };
      },
    },
  });
}
