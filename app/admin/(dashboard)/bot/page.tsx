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

  if (loading) return <p style={{ color: "var(--muted)" }}>Yükleniyor...</p>;

  return (
    <div>
      <div className="adm-page-head"><h1 className="adm-h1">Makale Botu</h1></div>

      <div className="adm-card">
        <div className="adm-card-h"><div><b>Makale Üret</b><small>Yapay zeka ile otomatik içerik oluştur</small></div></div>
        <div className="adm-card-b">
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div>
            <label className="adm-label">Kategori</label>
            <select value={category} onChange={(e) => loadTopics(e.target.value)} className="adm-select" style={{ width: "auto" }}>
              {CATEGORIES.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
            </select>
          </div>
          <div>
            <label className="adm-label">Adet</label>
            <select value={count} onChange={(e) => setCount(Number(e.target.value))} className="adm-select" style={{ width: "auto" }}>
              {[1, 2, 3, 5, 10].map((n) => (<option key={n} value={n}>{n} makale</option>))}
            </select>
          </div>
          <button onClick={generate} disabled={generating} className="adm-btn adm-btn-primary">
            {generating ? "Üretiliyor..." : "Makale Üret"}
          </button>
        </div>
        {result && (
          <div style={{ marginTop: 16, padding: "10px 14px", background: "var(--surface)", borderRadius: 8, fontSize: 13, color: result.startsWith("Hata") ? "var(--dn)" : "var(--up)" }}>
            {result}
          </div>
        )}
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-card-h"><div><b>Güncel Konular</b><small>{topics.length} başlık bulundu</small></div></div>
        <div className="adm-card-b">
        {topics.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 13 }}>Konu bulunamadı</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {topics.slice(0, 15).map((t, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--surface)", borderRadius: 8, gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, color: "var(--ink2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</p>
                  <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{t.source}</p>
                </div>
                <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: "var(--surface2)", color: "var(--ink2)", whiteSpace: "nowrap", fontFamily: "var(--mono)" }}>{t.category}</span>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-card-h"><div><b>Çalışma Geçmişi</b><small>Son bot çalıştırma kayıtları</small></div></div>
        <div className="adm-card-b">
        {runs.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 13 }}>Henüz çalışma yok</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {runs.map((r) => (
              <div key={r.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 13, color: "var(--ink2)", fontFamily: "var(--mono)" }}>{new Date(r.startedAt).toLocaleString("tr-TR")}</span>
                  <span style={{ fontSize: 11, padding: "4px 8px", borderRadius: 4, fontFamily: "var(--mono)", background: r.status === "completed" ? "var(--up-soft)" : "#fffbeb", color: r.status === "completed" ? "var(--up)" : "#d97706" }}>
                    {r.status}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  <Stat label="Bulunan" value={r.articlesFound} />
                  <Stat label="Eklenen" value={r.articlesAdded} color="var(--up)" />
                  <Stat label="Duplicate" value={r.duplicatesSkipped} color="#d97706" />
                </div>
                {r.errors && (
                  <details style={{ marginTop: 12 }}>
                    <summary style={{ fontSize: 11, color: "var(--dn)", cursor: "pointer" }}>Hatalar</summary>
                    <pre style={{ fontSize: 11, color: "var(--dn)", marginTop: 8, whiteSpace: "pre-wrap" }}>{r.errors}</pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div>
      <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", letterSpacing: ".06em", textTransform: "uppercase" }}>{label}</p>
      <p style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 700, color: color || "var(--ink)" }}>{value}</p>
    </div>
  );
}
