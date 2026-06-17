"use client";
import { useEffect, useState } from "react";

interface Topic {
  title: string;
  summary: string;
  category: string;
  source: string;
  imageUrl?: string;
}

interface BotRun {
  id: string;
  startedAt: string;
  finishedAt: string | null;
  articlesFound: number;
  articlesAdded: number;
  duplicatesSkipped: number;
  errors: string | null;
  status: string;
}

const CATEGORIES = [
  { value: "", label: "Tümü" },
  { value: "kripto", label: "Kripto" },
  { value: "borsa", label: "Borsa" },
  { value: "doviz", label: "Döviz" },
  { value: "altin", label: "Altın" },
  { value: "ekonomi", label: "Ekonomi" },
];

export default function BotPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [runs, setRuns] = useState<BotRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [category, setCategory] = useState("");
  const [count, setCount] = useState(3);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/bot/topics").then((r) => r.json()),
      fetch("/api/admin/bot-runs").then((r) => r.json()),
    ])
      .then(([t, r]) => {
        setTopics(t.topics || []);
        setRuns(r.runs || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const loadTopics = async (cat: string) => {
    setCategory(cat);
    const res = await fetch(`/api/bot/topics?category=${cat}`);
    const data = await res.json();
    setTopics(data.topics || []);
  };

  const generate = async () => {
    setGenerating(true);
    setResult(null);
    try {
      const res = await fetch("/api/bot/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count, category, words: 1000 }),
      });
      const data = await res.json();
      if (data.error) {
        setResult(`Hata: ${data.error}`);
      } else {
        setResult(
          `${data.added} makale oluşturuldu, ${data.duplicatesSkipped} duplicate atlandı` +
            (data.errors?.length ? `, ${data.errors.length} hata` : "")
        );
      }
      const runsRes = await fetch("/api/admin/bot-runs");
      const runsData = await runsRes.json();
      setRuns(runsData.runs || []);
    } catch (e) {
      setResult(`Hata: ${(e as Error).message}`);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <p style={{ color: "#999" }}>Yükleniyor...</p>;

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: "#111" }}>Makale Botu</h1>

      <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 10, padding: 20, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "#333" }}>Makale Üret</h2>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div>
            <label style={{ fontSize: 11, color: "#999", display: "block", marginBottom: 4 }}>Kategori</label>
            <select value={category} onChange={(e) => loadTopics(e.target.value)}
              style={{ background: "#fafafa", color: "#333", border: "1px solid #ddd", borderRadius: 6, padding: "8px 12px", fontSize: 13 }}>
              {CATEGORIES.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#999", display: "block", marginBottom: 4 }}>Adet</label>
            <select value={count} onChange={(e) => setCount(Number(e.target.value))}
              style={{ background: "#fafafa", color: "#333", border: "1px solid #ddd", borderRadius: 6, padding: "8px 12px", fontSize: 13 }}>
              {[1, 2, 3, 5, 10].map((n) => (<option key={n} value={n}>{n} makale</option>))}
            </select>
          </div>
          <button onClick={generate} disabled={generating}
            style={{ background: generating ? "#e5e5e5" : "#c73030", color: generating ? "#999" : "#fff", border: "none", borderRadius: 6, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: generating ? "not-allowed" : "pointer" }}>
            {generating ? "Üretiliyor..." : "Makale Üret"}
          </button>
        </div>
        {result && (
          <div style={{ marginTop: 16, padding: "10px 14px", background: "#fafafa", borderRadius: 6, fontSize: 13, color: result.startsWith("Hata") ? "#dc2626" : "#16a34a" }}>
            {result}
          </div>
        )}
      </div>

      <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 10, padding: 20, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "#333" }}>Güncel Konular ({topics.length})</h2>
        {topics.length === 0 ? (
          <p style={{ color: "#999", fontSize: 13 }}>Konu bulunamadı</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {topics.slice(0, 15).map((t, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#fafafa", borderRadius: 6, gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, color: "#333", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</p>
                  <p style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{t.source}</p>
                </div>
                <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: "#e5e5e5", color: "#666", whiteSpace: "nowrap" }}>{t.category}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 10, padding: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "#333" }}>Çalışma Geçmişi</h2>
        {runs.length === 0 ? (
          <p style={{ color: "#999", fontSize: 13 }}>Henüz çalışma yok</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {runs.map((r) => (
              <div key={r.id} style={{ background: "#fafafa", border: "1px solid #e5e5e5", borderRadius: 10, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 13, color: "#333" }}>{new Date(r.startedAt).toLocaleString("tr-TR")}</span>
                  <span style={{ fontSize: 11, padding: "4px 8px", borderRadius: 4, background: r.status === "completed" ? "#f0fdf4" : "#fffbeb", color: r.status === "completed" ? "#16a34a" : "#d97706" }}>
                    {r.status}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  <Stat label="Bulunan" value={r.articlesFound} />
                  <Stat label="Eklenen" value={r.articlesAdded} color="#16a34a" />
                  <Stat label="Duplicate" value={r.duplicatesSkipped} color="#d97706" />
                </div>
                {r.errors && (
                  <details style={{ marginTop: 12 }}>
                    <summary style={{ fontSize: 11, color: "#dc2626", cursor: "pointer" }}>Hatalar</summary>
                    <pre style={{ fontSize: 11, color: "#dc2626", marginTop: 8, whiteSpace: "pre-wrap" }}>{r.errors}</pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div>
      <p style={{ fontSize: 10, color: "#999" }}>{label}</p>
      <p style={{ fontSize: 20, fontWeight: 700, color: color || "#333" }}>{value}</p>
    </div>
  );
}
