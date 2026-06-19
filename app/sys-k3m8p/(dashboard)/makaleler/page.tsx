"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface ArticleRow {
  id: string; title: string; slug: string; category: string;
  status: string; articleSource: string; seoScore: number | null;
  publishedAt: string | null; createdAt: string; duplicateOf: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: "var(--up)", DRAFT: "#d97706", REJECTED: "var(--dn)", ARCHIVED: "var(--muted)",
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

  // eslint-disable-next-line react-hooks/set-state-in-effect -- mount/filtre değişiminde veri çek (kasıtlı)
  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
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
      <div className="adm-page-head">
        <h1 className="adm-h1">Makaleler <span className="adm-count">({total})</span></h1>
        <Link href="/sys-k3m8p/yeni" className="adm-btn adm-btn-primary">
          + Yeni Makale
        </Link>
      </div>

      <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Başlıkta ara..."
          className="adm-input" style={{ flex: 1 }} />
        <button type="submit" className="adm-btn">Ara</button>
        {search && <button type="button" onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }} className="adm-btn">Temizle</button>}
      </form>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["", "PUBLISHED", "DRAFT", "REJECTED", "ARCHIVED"].map(s => (
          <button key={s} onClick={() => { setFilter(s); setPage(1); }}
            className={`adm-pill${filter === s ? " on" : ""}`}>
            {s || "Tümü"}
          </button>
        ))}
      </div>

      {selected.size > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, padding: "10px 14px", background: "var(--paper)", border: "1px solid var(--border)", borderRadius: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--ink2)" }}>{selected.size} seçili</span>
          <BulkBtn onClick={() => bulkAction("publish")} color="var(--up)">Yayınla</BulkBtn>
          <BulkBtn onClick={() => bulkAction("draft")} color="#d97706">Taslak</BulkBtn>
          <BulkBtn onClick={() => bulkAction("archive")} color="var(--muted)">Arşivle</BulkBtn>
          <BulkBtn onClick={() => bulkAction("delete")} color="var(--dn)">Sil</BulkBtn>
        </div>
      )}

      {loading ? <p style={{ color: "var(--muted)" }}>Yükleniyor...</p> : (
        <div className="adm-card"><div className="adm-card-b">
        <table className="adm-table">
          <thead>
            <tr>
              <th style={{ width: 30 }}>
                <input type="checkbox" checked={selected.size === articles.length && articles.length > 0} onChange={selectAll} />
              </th>
              <th>Başlık</th>
              <th>Kategori</th>
              <th>Kaynak</th>
              <th>SEO</th>
              <th>Durum</th>
              <th style={{ textAlign: "right" }}>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {articles.map(a => (
              <tr key={a.id} style={{ background: selected.has(a.id) ? "var(--accent-soft)" : undefined }}>
                <td>
                  <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggleSelect(a.id)} />
                </td>
                <td style={{ maxWidth: 300 }}>
                  <Link href={`/sys-k3m8p/makaleler/${a.id}`} style={{ color: "var(--ink)" }}>
                    {a.title.slice(0, 55)}{a.title.length > 55 ? "..." : ""}
                  </Link>
                  {a.duplicateOf && <span style={{ marginLeft: 8, fontSize: 10, color: "var(--dn)" }}>DUP</span>}
                </td>
                <td style={{ color: "var(--muted)" }}>{a.category}</td>
                <td style={{ color: a.articleSource === "BOT" ? "var(--accent)" : "var(--ink2)", fontSize: 10 }}>{a.articleSource === "BOT" ? "Otomatik" : "Manuel"}</td>
                <td>
                  <span style={{ fontFamily: "var(--mono)", color: (a.seoScore || 0) >= 70 ? "var(--up)" : (a.seoScore || 0) >= 60 ? "#d97706" : "var(--dn)" }}>
                    {a.seoScore ?? "-"}
                  </span>
                  {a.seoScore != null && a.seoScore < 60 && a.status === "PUBLISHED" && (
                    <span title="Yayında ama SEO skoru düşük" style={{ marginLeft: 6, fontSize: 9, color: "var(--dn)", background: "var(--dn-soft)", border: "1px solid var(--dn)", borderRadius: 3, padding: "1px 4px" }}>
                      DÜŞÜK
                    </span>
                  )}
                </td>
                <td><span style={{ color: STATUS_COLORS[a.status] || "var(--muted)", fontSize: 11, fontFamily: "var(--mono)" }}>{a.status}</span></td>
                <td style={{ textAlign: "right" }}>
                  <Link href={`/${a.slug}`} target="_blank" style={{ marginRight: 8, fontSize: 10, color: "var(--muted)" }}>Önizle</Link>
                  <Link href={`/sys-k3m8p/makaleler/${a.id}`} style={{ fontSize: 10, color: "var(--accent)" }}>Düzenle</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div></div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "center" }}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="adm-btn">
          ← Önceki
        </button>
        <span style={{ padding: "6px 12px", fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)" }}>Sayfa {page}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={articles.length < 20} className="adm-btn">
          Sonraki →
        </button>
      </div>
    </div>
  );
}

function BulkBtn({ onClick, color, children }: { onClick: () => void; color: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{ padding: "5px 10px", fontSize: 11, border: `1px solid ${color}`, background: "transparent", color, borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
      {children}
    </button>
  );
}
