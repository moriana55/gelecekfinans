"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface ArticleRow {
  id: string; title: string; slug: string; category: string;
  status: string; articleSource: string; seoScore: number | null;
  publishedAt: string | null; createdAt: string; duplicateOf: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: "#16a34a", DRAFT: "#d97706", REJECTED: "#dc2626", ARCHIVED: "#999",
};

export default function ArticleList() {
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const fetchArticles = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (filter) params.set("status", filter);
    if (search) params.set("q", search);
    fetch(`/api/admin/articles?${params}`)
      .then(r => r.json())
      .then(d => { setArticles(d.articles); setTotal(d.total); setSelected(new Set()); })
      .finally(() => setLoading(false));
  }, [page, filter, search]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function selectAll() {
    if (selected.size === articles.length) setSelected(new Set());
    else setSelected(new Set(articles.map(a => a.id)));
  }

  async function bulkAction(action: string) {
    if (selected.size === 0) return;
    if (action === "delete" && !confirm(`${selected.size} makaleyi silmek istediğine emin misin?`)) return;
    await fetch("/api/admin/articles/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selected), action }),
    });
    await fetch("/api/admin/revalidate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    fetchArticles();
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111" }}>Makaleler <span style={{ color: "#999", fontSize: 14, fontWeight: 400 }}>({total})</span></h1>
        <Link href="/admin/yeni" style={{ padding: "8px 16px", background: "#c73030", color: "#fff", borderRadius: 6, fontSize: 13, fontWeight: 600 }}>
          + Yeni Makale
        </Link>
      </div>

      <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Başlıkta ara..."
          style={{ flex: 1, padding: "8px 12px", background: "#fff", border: "1px solid #ddd", borderRadius: 6, color: "#111", fontSize: 13 }} />
        <button type="submit" style={{ padding: "8px 14px", background: "#e5e5e5", color: "#333", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>Ara</button>
        {search && <button type="button" onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
          style={{ padding: "8px 14px", background: "transparent", color: "#888", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>Temizle</button>}
      </form>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["", "PUBLISHED", "DRAFT", "REJECTED", "ARCHIVED"].map(s => (
          <button key={s} onClick={() => { setFilter(s); setPage(1); }}
            style={{ padding: "6px 12px", fontSize: 11, borderRadius: 6, border: "1px solid #ddd", background: filter === s ? "#111" : "transparent", color: filter === s ? "#fff" : "#888", cursor: "pointer" }}>
            {s || "Tümü"}
          </button>
        ))}
      </div>

      {selected.size > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, padding: "10px 14px", background: "#fff", border: "1px solid #e5e5e5", borderRadius: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#666" }}>{selected.size} seçili</span>
          <BulkBtn onClick={() => bulkAction("publish")} color="#16a34a">Yayınla</BulkBtn>
          <BulkBtn onClick={() => bulkAction("draft")} color="#d97706">Taslak</BulkBtn>
          <BulkBtn onClick={() => bulkAction("archive")} color="#888">Arşivle</BulkBtn>
          <BulkBtn onClick={() => bulkAction("delete")} color="#dc2626">Sil</BulkBtn>
        </div>
      )}

      {loading ? <p style={{ color: "#999" }}>Yükleniyor...</p> : (
        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e5e5e5", color: "#999" }}>
              <th style={{ width: 30, padding: "10px 0" }}>
                <input type="checkbox" checked={selected.size === articles.length && articles.length > 0} onChange={selectAll} />
              </th>
              <th style={{ textAlign: "left", padding: "10px 0" }}>Başlık</th>
              <th style={{ textAlign: "left" }}>Kategori</th>
              <th style={{ textAlign: "left" }}>Kaynak</th>
              <th style={{ textAlign: "left" }}>SEO</th>
              <th style={{ textAlign: "left" }}>Durum</th>
              <th style={{ textAlign: "right" }}>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {articles.map(a => (
              <tr key={a.id} style={{ borderBottom: "1px solid #f0f0f0", background: selected.has(a.id) ? "#f0f4ff" : undefined }}>
                <td style={{ padding: "10px 0" }}>
                  <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggleSelect(a.id)} />
                </td>
                <td style={{ padding: "10px 0", maxWidth: 300 }}>
                  <Link href={`/admin/makaleler/${a.id}`} style={{ color: "#222" }}>
                    {a.title.slice(0, 55)}{a.title.length > 55 ? "..." : ""}
                  </Link>
                  {a.duplicateOf && <span style={{ marginLeft: 8, fontSize: 10, color: "#dc2626" }}>DUP</span>}
                </td>
                <td style={{ color: "#888" }}>{a.category}</td>
                <td style={{ color: a.articleSource === "BOT" ? "#2563eb" : "#7c3aed", fontSize: 10 }}>{a.articleSource === "BOT" ? "Otomatik" : "Manuel"}</td>
                <td>
                  <span style={{ color: (a.seoScore || 0) >= 70 ? "#16a34a" : (a.seoScore || 0) >= 60 ? "#d97706" : "#dc2626" }}>
                    {a.seoScore ?? "-"}
                  </span>
                  {a.seoScore != null && a.seoScore < 60 && a.status === "PUBLISHED" && (
                    <span title="Yayında ama SEO skoru düşük" style={{ marginLeft: 6, fontSize: 9, color: "#dc2626", background: "#dc262611", border: "1px solid #dc262633", borderRadius: 3, padding: "1px 4px" }}>
                      DÜŞÜK
                    </span>
                  )}
                </td>
                <td><span style={{ color: STATUS_COLORS[a.status] || "#888", fontSize: 11 }}>{a.status}</span></td>
                <td style={{ textAlign: "right" }}>
                  <Link href={`/${a.slug}`} target="_blank" style={{ marginRight: 8, fontSize: 10, color: "#999" }}>Önizle</Link>
                  <Link href={`/admin/makaleler/${a.id}`} style={{ fontSize: 10, color: "#2563eb" }}>Düzenle</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "center" }}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
          style={{ padding: "6px 12px", fontSize: 12, border: "1px solid #ddd", background: "transparent", color: "#888", cursor: "pointer", borderRadius: 6 }}>
          ← Önceki
        </button>
        <span style={{ padding: "6px 12px", fontSize: 12, color: "#999" }}>Sayfa {page}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={articles.length < 20}
          style={{ padding: "6px 12px", fontSize: 12, border: "1px solid #ddd", background: "transparent", color: "#888", cursor: "pointer", borderRadius: 6 }}>
          Sonraki →
        </button>
      </div>
    </div>
  );
}

function BulkBtn({ onClick, color, children }: { onClick: () => void; color: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{ padding: "5px 10px", fontSize: 11, border: `1px solid ${color}33`, background: `${color}08`, color, borderRadius: 4, cursor: "pointer" }}>
      {children}
    </button>
  );
}
