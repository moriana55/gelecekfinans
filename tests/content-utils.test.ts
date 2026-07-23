import assert from "node:assert/strict";
import test from "node:test";

import { readingTime } from "../lib/reading-time";
import { sanitizeArticleHtml } from "../lib/sanitize";
import { slugify } from "../lib/slug";

test("slugify Türkçe karakterleri ve tekrar eden ayraçları normalize eder", () => {
  assert.equal(slugify("  Çeyrek Altın -- Güncel Fiyatı!  "), "ceyrek-altin-guncel-fiyati");
});

test("slugify çıktısını 80 karakterle sınırlar", () => {
  assert.ok(slugify("a".repeat(120)).length <= 80);
});

test("readingTime boş içerikte sıfır döner", () => {
  assert.equal(readingTime("<p>   </p>"), "0 dk okuma");
});

test("readingTime HTML etiketlerini kelime saymaz", () => {
  assert.equal(readingTime(`<p>${"kelime ".repeat(201)}</p>`), "2 dk okuma");
});

test("sanitizeArticleHtml script ve tehlikeli bağlantıları temizler", () => {
  const clean = sanitizeArticleHtml('<script>alert(1)</script><a href="javascript:alert(1)" onclick="x()">ok</a>');
  assert.equal(clean.includes("<script"), false);
  assert.equal(clean.includes("javascript:"), false);
  assert.equal(clean.includes("onclick"), false);
});

test("sanitizeArticleHtml dış bağlantılara güvenli rel ekler", () => {
  const clean = sanitizeArticleHtml('<a href="https://example.com">kaynak</a>');
  assert.match(clean, /target="_blank"/);
  assert.match(clean, /rel="noopener noreferrer nofollow"/);
});
