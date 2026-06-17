"use client";
import { useEffect, useState } from "react";

interface TopArticle {
  path: string;
  views: number;
  title: string;
  category: string | null;
}

interface Stats {
  totalViews: number;
  topPages: { path: string; views: number }[];
  topArticles: TopArticle[];
  daily: { date: string; count: number }[];
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [period, setPeriod] = useState("7d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/stats?period=${period}`)
      .then(r => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) return <p style={{ color: "#999" }}>Yükleniyor...</p>;
  if (!stats) return null;

  const maxDaily = Math.max(...stats.daily.map(d => d.count), 1);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111" }}>Analytics</h1>
        <div style={{ display: "flex", gap: 6 }}>
          {["24h", "7d", "30d"].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{ padding: "6px 12px", fontSize: 11, borderRadius: 6, border: "1px solid #ddd", background: period === p ? "#111" : "transparent", color: period === p ? "#fff" : "#888", cursor: "pointer" }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 10, padding: 24, marginBottom: 24 }}>
        <p style={{ fontSize: 11, color: "#999" }}>Toplam Sayfa Görüntüleme</p>
        <p style={{ fontSize: 36, fontWeight: 800, color: "#111" }}>{stats.totalViews.toLocaleString("tr-TR")}</p>
      </div>

      {stats.daily.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 10, padding: 20, marginBottom: 24 }}>
          <p style={{ fontSize: 12, color: "#999", marginBottom: 16 }}>Günlük Trafik</p>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 120 }}>
            {stats.daily.map(d => (
              <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: "100%", background: "#c73030", borderRadius: 3, height: `${(d.count / maxDaily) * 100}%`, minHeight: 2 }} />
                <span style={{ fontSize: 8, color: "#999", transform: "rotate(-45deg)", whiteSpace: "nowrap" }}>
                  {d.date.slice(5)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.topArticles && stats.topArticles.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 10, padding: 20, marginBottom: 24 }}>
          <p style={{ fontSize: 12, color: "#999", marginBottom: 16 }}>En Çok Okunan Makaleler</p>
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
            <tbody>
              {stats.topArticles.map((a, i) => (
                <tr key={a.path} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "10px 0", color: "#ccc", width: 30 }}>{i + 1}</td>
                  <td style={{ padding: "10px 0" }}>
                    <span style={{ color: "#222" }}>{a.title.slice(0, 60)}{a.title.length > 60 ? "..." : ""}</span>
                    {a.category && <span style={{ marginLeft: 8, fontSize: 10, color: "#888", background: "#f0f0f0", padding: "2px 6px", borderRadius: 3 }}>{a.category}</span>}
                  </td>
                  <td style={{ padding: "10px 0", color: "#c73030", textAlign: "right", fontWeight: 600 }}>{a.views.toLocaleString("tr-TR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 10, padding: 20 }}>
        <p style={{ fontSize: 12, color: "#999", marginBottom: 16 }}>Tüm Sayfa Görüntülemeleri</p>
        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
          <tbody>
            {stats.topPages.map((p, i) => (
              <tr key={p.path} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "8px 0", color: "#ccc", width: 30 }}>{i + 1}</td>
                <td style={{ padding: "8px 0", color: "#333" }}>{p.path}</td>
                <td style={{ padding: "8px 0", color: "#c73030", textAlign: "right", fontWeight: 600 }}>{p.views}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
