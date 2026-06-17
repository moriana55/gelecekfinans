import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function AdminDashboard() {
  const [total, published, draft, rejected, botRuns, subscriberCount, avgSeoResult, noLinkArticles, lowSeoArticles, todayViews] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.article.count({ where: { status: "REJECTED" } }),
    prisma.botRun.findMany({ orderBy: { startedAt: "desc" }, take: 5 }),
    prisma.subscriber.count({ where: { active: true } }),
    prisma.article.aggregate({ where: { status: "PUBLISHED", seoScore: { not: null } }, _avg: { seoScore: true } }),
    prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM "Article" WHERE status = 'PUBLISHED' AND content NOT LIKE '%href="/%'`,
    prisma.article.findMany({ where: { status: "PUBLISHED", seoScore: { lt: 60 } }, select: { id: true, title: true, seoScore: true, slug: true }, orderBy: { seoScore: "asc" }, take: 5 }),
    prisma.pageView.count({ where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
  ]);

  const avgSeo = Math.round(avgSeoResult._avg.seoScore || 0);
  const noLinks = Number(noLinkArticles[0]?.count || 0);

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: "#111" }}>Dashboard</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 }}>
        <StatCard label="Toplam Makale" value={total} />
        <StatCard label="Yayında" value={published} color="#16a34a" />
        <StatCard label="Taslak" value={draft} color="#d97706" />
        <StatCard label="Bugün Görüntüleme" value={todayViews} color="#2563eb" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        <StatCard label="Ort. SEO Skoru" value={avgSeo} color={avgSeo >= 70 ? "#16a34a" : avgSeo >= 50 ? "#d97706" : "#dc2626"} />
        <StatCard label="İç Linksiz Makale" value={noLinks} color={noLinks > 0 ? "#dc2626" : "#16a34a"} />
        <StatCard label="Aboneler" value={subscriberCount} color="#7c3aed" />
        <StatCard label="Reddedilen" value={rejected} color="#dc2626" />
      </div>

      {/* Low SEO Articles */}
      {lowSeoArticles.length > 0 && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: 20, marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "#dc2626" }}>Düşük SEO Skorlu Makaleler</h2>
          {lowSeoArticles.map(a => (
            <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #fee2e2" }}>
              <Link href={`/admin/makaleler/${a.id}`} style={{ fontSize: 13, color: "#333", flex: 1 }}>
                {a.title.slice(0, 60)}{a.title.length > 60 ? "..." : ""}
              </Link>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#dc2626", marginLeft: 12 }}>{a.seoScore}</span>
            </div>
          ))}
        </div>
      )}

      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: "#888" }}>Son Bot Çalışmaları</h2>
      {botRuns.length === 0 ? (
        <p style={{ color: "#999", fontSize: 13 }}>Henüz bot çalışması kaydı yok.</p>
      ) : (
        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e5e5e5", color: "#999" }}>
              <th style={{ padding: "8px 0", textAlign: "left" }}>Tarih</th>
              <th style={{ textAlign: "left" }}>Bulunan</th>
              <th style={{ textAlign: "left" }}>Eklenen</th>
              <th style={{ textAlign: "left" }}>Duplicate</th>
              <th style={{ textAlign: "left" }}>Durum</th>
            </tr>
          </thead>
          <tbody>
            {botRuns.map(r => (
              <tr key={r.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "8px 0" }}>{r.startedAt.toLocaleString("tr-TR")}</td>
                <td>{r.articlesFound}</td>
                <td style={{ color: "#16a34a" }}>{r.articlesAdded}</td>
                <td style={{ color: "#d97706" }}>{r.duplicatesSkipped}</td>
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
    <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 10, padding: 20 }}>
      <p style={{ fontSize: 11, color: "#999", marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 800, color: color || "#111" }}>{value}</p>
    </div>
  );
}
