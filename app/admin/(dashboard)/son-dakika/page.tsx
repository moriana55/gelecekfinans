"use client";
import { useEffect, useState } from "react";

interface BN {
  id: string;
  text: string;
  url?: string | null;
  active: boolean;
  live?: boolean;
  createdAt: string;
  expiresAt?: string | null;
}

const TTL_OPTIONS = [1, 3, 6, 12, 24];

export default function BreakingNewsAdmin() {
  const [items, setItems] = useState<BN[]>([]);
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [ttlHours, setTtlHours] = useState(6);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    fetch("/api/admin/breaking-news")
      .then(r => r.json())
      .then(d => {
        setItems(d.items || []);
        if (typeof d.defaultTtlHours === "number") setTtlHours(d.defaultTtlHours);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function create() {
    setError("");
    if (!text.trim()) return;
    const res = await fetch("/api/admin/breaking-news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, url: url || null, ttlHours }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Yayınlanamadı");
      return;
    }
    setText("");
    setUrl("");
    load();
  }

  async function deactivateAll() {
    await fetch("/api/admin/breaking-news", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setItems(prev => prev.map(i => ({ ...i, active: false, live: false })));
  }

  async function remove(id: string) {
    await fetch("/api/admin/breaking-news", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setItems(prev => prev.filter(i => i.id !== id));
  }

  if (loading) return <p style={{ color: "#999" }}>Yükleniyor...</p>;

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: "#111" }}>Son Dakika</h1>
      <p style={{ fontSize: 13, color: "#999", marginBottom: 24 }}>
        Aktif son dakika haberi sitenin en üstünde kırmızı banner olarak görünür. Süre dolunca otomatik kapanır.
      </p>

      <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 10, padding: 20, marginBottom: 24 }}>
        <input value={text} onChange={e => setText(e.target.value)} maxLength={280} placeholder="Son dakika metni..."
          style={{ width: "100%", padding: "10px 12px", background: "#fafafa", border: "1px solid #ddd", borderRadius: 6, color: "#111", fontSize: 13, marginBottom: 8 }} />
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Link (opsiyonel, http/https)"
          style={{ width: "100%", padding: "8px 12px", background: "#fafafa", border: "1px solid #ddd", borderRadius: 6, color: "#111", fontSize: 12, marginBottom: 12 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <label style={{ fontSize: 11, color: "#999" }}>Geçerlilik süresi:</label>
          <select value={ttlHours} onChange={e => setTtlHours(parseInt(e.target.value))}
            style={{ padding: "6px 10px", background: "#fafafa", border: "1px solid #ddd", borderRadius: 6, color: "#111", fontSize: 12 }}>
            {TTL_OPTIONS.map(h => <option key={h} value={h}>{h} saat</option>)}
          </select>
        </div>
        {error && <p style={{ fontSize: 12, color: "#dc2626", marginBottom: 10 }}>{error}</p>}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={create}
            style={{ padding: "8px 16px", background: "#c73030", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Yayınla
          </button>
          <button onClick={deactivateAll}
            style={{ padding: "8px 16px", background: "transparent", color: "#888", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>
            Tümünü Kapat
          </button>
        </div>
      </div>

      {items.map(item => {
        const isLive = item.live ?? item.active;
        return (
          <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: isLive ? "#16a34a" : "#ddd", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, color: isLive ? "#111" : "#999" }}>{item.text}</p>
              <p style={{ fontSize: 10, color: "#ccc", marginTop: 2 }}>
                {new Date(item.createdAt).toLocaleString("tr-TR")}
                {item.expiresAt && (
                  <span style={{ marginLeft: 8 }}>
                    · {isLive ? "Bitiş" : "Bitti"}: {new Date(item.expiresAt).toLocaleString("tr-TR")}
                  </span>
                )}
              </p>
            </div>
            <button onClick={() => remove(item.id)}
              style={{ fontSize: 10, color: "#dc2626", background: "none", border: "none", cursor: "pointer" }}>Sil</button>
          </div>
        );
      })}
    </div>
  );
}
