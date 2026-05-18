"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface ArticleRow {
  id: string; title: string; slug: string; category: string;
  status: string; articleSource: string; seoScore: number | null;
  publishedAt: string | null; createdAt: string; duplicateOf: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: "#4ade80", DRAFT: "#fbbf24", REJECTED: "#f87171", ARCHIVED: "#666",
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
    // Revalidate
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
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Makaleler <span style={{ color: "#555", fontSize: 14, fontWeight: 400 }}>({total})</span></h1>
        <Link href="/admin/yeni" style={{ padding: "8px 16px", background: "#fff", color: "#000", borderRadius: 4, fontSize: 13, fontWeight: 600 }}>
          + Yeni Makale
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Başlıkta ara..."
          style={{ flex: 1, padding: "8px 12px", background: "#151515", border: "1px solid #333", borderRadius: 4, color: "#fff", fontSize: 13 }} />
        <button type="submit" style={{ padding: "8px 14px", background: "#333", color: "#fff", border: "none", borderRadius: 4, fontSize: 12, cursor: "pointer" }}>Ara</button>
        {search && <button type="button" onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
          style={{ padding: "8px 14px", background: "transparent", color: "#888", border: "1px solid #333", borderRadius: 4, fontSize: 12, cursor: "pointer" }}>Temizle</button>}
      </form>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["", "PUBLISHED", "DRAFT", "REJECTED", "ARCHIVED"].map(s => (
          <button key={s} onClick={() => { setFilter(s); setPage(1); }}
            style={{ padding: "6px 12px", fontSize: 11, borderRadius: 4, border: "1px solid #333", background: filter === s ? "#fff" : "transparent", color: filter === s ? "#000" : "#888", cursor: "pointer" }}>
            {s || "Tümü"}
          </button>
        ))}
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, padding: "10px 14px", background: "#151515", border: "1px solid #222", borderRadius: 6, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#aaa" }}>{selected.size} seçili</span>
          <BulkBtn onClick={() => bulkAction("publish")} color="#4ade80">Yayınla</BulkBtn>
          <BulkBtn onClick={() => bulkAction("draft")} color="#fbbf24">Taslak</BulkBtn>
          <BulkBtn onClick={() => bulkAction("archive")} color="#888">Arşivle</BulkBtn>
          <BulkBtn onClick={() => bulkAction("delete")} color="#f87171">Sil</BulkBtn>
        </div>
      )}

      {loading ? <p style={{ color: "#555" }}>Yükleniyor...</p> : (
        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #222", color: "#555" }}>
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
              <tr key={a.id} style={{ borderBottom: "1px solid #1a1a1a", background: selected.has(a.id) ? "#1a1a2a" : undefined }}>
                <td style={{ padding: "10px 0" }}>
                  <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggleSelect(a.id)} />
                </td>
                <td style={{ padding: "10px 0", maxWidth: 300 }}>
                  <Link href={`/admin/makaleler/${a.id}`} style={{ color: "#ddd" }}>
                    {a.title.slice(0, 55)}{a.title.length > 55 ? "..." : ""}
                  </Link>
                  {a.duplicateOf && <span style={{ marginLeft: 8, fontSize: 10, color: "#f87171" }}>DUP</span>}
                </td>
                <td style={{ color: "#888" }}>{a.category}</td>
                <td style={{ color: a.articleSource === "BOT" ? "#60a5fa" : "#c084fc", fontSize: 10 }}>{a.articleSource}</td>
                <td>
                  <span style={{ color: (a.seoScore || 0) >= 70 ? "#4ade80" : (a.seoScore || 0) >= 50 ? "#fbbf24" : "#f87171" }}>
                    {a.seoScore ?? "-"}
                  </span>
                </td>
                <td><span style={{ color: STATUS_COLORS[a.status] || "#888", fontSize: 11 }}>{a.status}</span></td>
                <td style={{ textAlign: "right" }}>
                  <Link href={`/${a.slug}`} target="_blank" style={{ marginRight: 8, fontSize: 10, color: "#555" }}>Önizle</Link>
                  <Link href={`/admin/makaleler/${a.id}`} style={{ fontSize: 10, color: "#60a5fa" }}>Düzenle</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "center" }}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
          style={{ padding: "6px 12px", fontSize: 12, border: "1px solid #333", background: "transparent", color: "#888", cursor: "pointer", borderRadius: 4 }}>
          ← Önceki
        </button>
        <span style={{ padding: "6px 12px", fontSize: 12, color: "#555" }}>Sayfa {page}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={articles.length < 20}
          style={{ padding: "6px 12px", fontSize: 12, border: "1px solid #333", background: "transparent", color: "#888", cursor: "pointer", borderRadius: 4 }}>
          Sonraki →
        </button>
      </div>
    </div>
  );
}

function BulkBtn({ onClick, color, children }: { onClick: () => void; color: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{ padding: "5px 10px", fontSize: 11, border: `1px solid ${color}44`, background: `${color}11`, color, borderRadius: 3, cursor: "pointer" }}>
      {children}
    </button>
  );
}
