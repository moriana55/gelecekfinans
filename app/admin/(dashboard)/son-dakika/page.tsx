"use client";
import { useEffect, useState } from "react";

interface BN { id: string; text: string; url?: string | null; active: boolean; createdAt: string; }

export default function BreakingNewsAdmin() {
  const [items, setItems] = useState<BN[]>([]);
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/breaking-news").then(r => r.json()).then(d => setItems(d.items)).finally(() => setLoading(false));
  }, []);

  async function create() {
    if (!text.trim()) return;
    const res = await fetch("/api/admin/breaking-news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, url: url || null }),
    });
    const item = await res.json();
    setItems(prev => [{ ...item, active: true }, ...prev.map(i => ({ ...i, active: false }))]);
    setText("");
    setUrl("");
  }

  async function deactivateAll() {
    await fetch("/api/admin/breaking-news", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setItems(prev => prev.map(i => ({ ...i, active: false })));
  }

  async function remove(id: string) {
    await fetch("/api/admin/breaking-news", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setItems(prev => prev.filter(i => i.id !== id));
  }

  if (loading) return <p style={{ color: "#555" }}>Yükleniyor...</p>;

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Son Dakika</h1>
      <p style={{ fontSize: 13, color: "#666", marginBottom: 24 }}>
        Aktif son dakika haberi sitenin en üstünde kırmızı banner olarak görünür.
      </p>

      {/* Create new */}
      <div style={{ background: "#151515", border: "1px solid #222", borderRadius: 8, padding: 20, marginBottom: 24 }}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Son dakika metni..."
          style={{ width: "100%", padding: "10px 12px", background: "#0a0a0a", border: "1px solid #333", borderRadius: 4, color: "#fff", fontSize: 13, marginBottom: 8 }} />
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Link (opsiyonel)"
          style={{ width: "100%", padding: "8px 12px", background: "#0a0a0a", border: "1px solid #333", borderRadius: 4, color: "#fff", fontSize: 12, marginBottom: 12 }} />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={create}
            style={{ padding: "8px 16px", background: "#b91c1c", color: "#fff", border: "none", borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Yayınla
          </button>
          <button onClick={deactivateAll}
            style={{ padding: "8px 16px", background: "transparent", color: "#888", border: "1px solid #333", borderRadius: 4, fontSize: 12, cursor: "pointer" }}>
            Tümünü Kapat
          </button>
        </div>
      </div>

      {/* History */}
      {items.map(item => (
        <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #1a1a1a" }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: item.active ? "#4ade80" : "#333", flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, color: item.active ? "#fff" : "#666" }}>{item.text}</p>
            <p style={{ fontSize: 10, color: "#444", marginTop: 2 }}>{new Date(item.createdAt).toLocaleString("tr-TR")}</p>
          </div>
          <button onClick={() => remove(item.id)}
            style={{ fontSize: 10, color: "#f87171", background: "none", border: "none", cursor: "pointer" }}>Sil</button>
        </div>
      ))}
    </div>
  );
}
