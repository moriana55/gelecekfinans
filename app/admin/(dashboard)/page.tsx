import { prisma } from "@/lib/db";

export default async function AdminDashboard() {
  const [total, published, draft, rejected, botRuns] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.article.count({ where: { status: "REJECTED" } }),
    prisma.botRun.findMany({ orderBy: { startedAt: "desc" }, take: 5 }),
  ]);

  const lowSeo = await prisma.article.count({ where: { seoScore: { lt: 50 } } });

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Dashboard</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        <StatCard label="Toplam Makale" value={total} />
        <StatCard label="Yayında" value={published} color="#4ade80" />
        <StatCard label="Taslak" value={draft} color="#fbbf24" />
        <StatCard label="SEO Düşük (<50)" value={lowSeo} color="#f87171" />
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: "#888" }}>Son Bot Çalışmaları</h2>
      {botRuns.length === 0 ? (
        <p style={{ color: "#555", fontSize: 13 }}>Henüz bot çalışması kaydı yok.</p>
      ) : (
        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #222", color: "#666" }}>
              <th style={{ padding: "8px 0", textAlign: "left" }}>Tarih</th>
              <th style={{ textAlign: "left" }}>Bulunan</th>
              <th style={{ textAlign: "left" }}>Eklenen</th>
              <th style={{ textAlign: "left" }}>Duplicate</th>
              <th style={{ textAlign: "left" }}>Durum</th>
            </tr>
          </thead>
          <tbody>
            {botRuns.map(r => (
              <tr key={r.id} style={{ borderBottom: "1px solid #1a1a1a" }}>
                <td style={{ padding: "8px 0" }}>{r.startedAt.toLocaleString("tr-TR")}</td>
                <td>{r.articlesFound}</td>
                <td style={{ color: "#4ade80" }}>{r.articlesAdded}</td>
                <td style={{ color: "#fbbf24" }}>{r.duplicatesSkipped}</td>
                <td>{r.status === "completed" ? "✓" : "⏳"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div style={{ background: "#151515", border: "1px solid #222", borderRadius: 8, padding: 20 }}>
      <p style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 800, color: color || "#fff" }}>{value}</p>
    </div>
  );
}
