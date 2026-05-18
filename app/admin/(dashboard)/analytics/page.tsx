"use client";
import { useEffect, useState } from "react";

interface Stats {
  totalViews: number;
  topPages: { path: string; views: number }[];
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

  if (loading) return <p style={{ color: "#555" }}>Yükleniyor...</p>;
  if (!stats) return null;

  const maxDaily = Math.max(...stats.daily.map(d => d.count), 1);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Analytics</h1>
        <div style={{ display: "flex", gap: 6 }}>
          {["24h", "7d", "30d"].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{ padding: "6px 12px", fontSize: 11, borderRadius: 4, border: "1px solid #333", background: period === p ? "#fff" : "transparent", color: period === p ? "#000" : "#888", cursor: "pointer" }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Total */}
      <div style={{ background: "#151515", border: "1px solid #222", borderRadius: 8, padding: 24, marginBottom: 24 }}>
        <p style={{ fontSize: 11, color: "#666" }}>Toplam Sayfa Görüntüleme</p>
        <p style={{ fontSize: 36, fontWeight: 800, color: "#fff" }}>{stats.totalViews.toLocaleString("tr-TR")}</p>
      </div>

      {/* Daily chart (simple bar) */}
      {stats.daily.length > 0 && (
        <div style={{ background: "#151515", border: "1px solid #222", borderRadius: 8, padding: 20, marginBottom: 24 }}>
          <p style={{ fontSize: 12, color: "#666", marginBottom: 16 }}>Günlük Trafik</p>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 120 }}>
            {stats.daily.map(d => (
              <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: "100%", background: "#4ade80", borderRadius: 2, height: `${(d.count / maxDaily) * 100}%`, minHeight: 2 }} />
                <span style={{ fontSize: 8, color: "#555", transform: "rotate(-45deg)", whiteSpace: "nowrap" }}>
                  {d.date.slice(5)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top pages */}
      <div style={{ background: "#151515", border: "1px solid #222", borderRadius: 8, padding: 20 }}>
        <p style={{ fontSize: 12, color: "#666", marginBottom: 16 }}>En Çok Görüntülenen Sayfalar</p>
        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
          <tbody>
            {stats.topPages.map((p, i) => (
              <tr key={p.path} style={{ borderBottom: "1px solid #1a1a1a" }}>
                <td style={{ padding: "8px 0", color: "#555", width: 30 }}>{i + 1}</td>
                <td style={{ padding: "8px 0", color: "#ddd" }}>{p.path}</td>
                <td style={{ padding: "8px 0", color: "#4ade80", textAlign: "right", fontWeight: 600 }}>{p.views}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
