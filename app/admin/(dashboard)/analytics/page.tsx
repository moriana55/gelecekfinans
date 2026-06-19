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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- re-fetch sırasında loading göstergesi (kasıtlı)
    setLoading(true);
    fetch(`/api/admin/stats?period=${period}`)
      .then(r => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) return <p style={{ color: "var(--muted)" }}>Yükleniyor...</p>;
  if (!stats) return null;

  const maxDaily = Math.max(...stats.daily.map(d => d.count), 1);

  return (
    <div>
      <div className="adm-page-head">
        <h1 className="adm-h1">Analytics</h1>
        <div style={{ display: "flex", gap: 6 }}>
          {["24h", "7d", "30d"].map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`adm-pill${period === p ? " on" : ""}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="adm-stat" style={{ marginBottom: 22, padding: 24 }}>
        <div className="k">Toplam Sayfa Görüntüleme</div>
        <div className="v" style={{ fontSize: 36, marginTop: 10 }}>{stats.totalViews.toLocaleString("tr-TR")}</div>
      </div>

      {stats.daily.length > 0 && (
        <div className="adm-card"><div className="adm-card-b">
          <p className="adm-label" style={{ marginBottom: 16 }}>Günlük Trafik</p>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 120 }}>
            {stats.daily.map(d => (
              <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: "100%", background: "var(--accent)", borderRadius: 3, height: `${(d.count / maxDaily) * 100}%`, minHeight: 2 }} />
                <span style={{ fontSize: 8, color: "var(--muted)", transform: "rotate(-45deg)", whiteSpace: "nowrap" }}>
                  {d.date.slice(5)}
                </span>
              </div>
            ))}
          </div>
        </div></div>
      )}

      {stats.topArticles && stats.topArticles.length > 0 && (
        <div className="adm-card"><div className="adm-card-b">
          <p className="adm-label" style={{ marginBottom: 16 }}>En Çok Okunan Makaleler</p>
          <table className="adm-table">
            <tbody>
              {stats.topArticles.map((a, i) => (
                <tr key={a.path}>
                  <td style={{ color: "var(--faint)", width: 30, fontFamily: "var(--mono)" }}>{i + 1}</td>
                  <td>
                    <span style={{ color: "var(--ink)" }}>{a.title.slice(0, 60)}{a.title.length > 60 ? "..." : ""}</span>
                    {a.category && <span style={{ marginLeft: 8, fontSize: 10, color: "var(--muted)", background: "var(--surface)", padding: "2px 6px", borderRadius: 3, fontFamily: "var(--mono)" }}>{a.category}</span>}
                  </td>
                  <td style={{ color: "var(--accent)", textAlign: "right", fontWeight: 600, fontFamily: "var(--mono)" }}>{a.views.toLocaleString("tr-TR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div></div>
      )}

      <div className="adm-card"><div className="adm-card-b">
        <p className="adm-label" style={{ marginBottom: 16 }}>Tüm Sayfa Görüntülemeleri</p>
        <table className="adm-table">
          <tbody>
            {stats.topPages.map((p, i) => (
              <tr key={p.path}>
                <td style={{ color: "var(--faint)", width: 30, fontFamily: "var(--mono)" }}>{i + 1}</td>
                <td style={{ color: "var(--ink2)" }}>{p.path}</td>
                <td style={{ color: "var(--accent)", textAlign: "right", fontWeight: 600, fontFamily: "var(--mono)" }}>{p.views}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></div>
    </div>
  );
}
