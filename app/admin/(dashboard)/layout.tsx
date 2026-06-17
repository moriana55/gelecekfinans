import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/giris");

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#fafafa", color: "#111" }}>
      <aside style={{ width: 230, background: "#fff", borderRight: "1px solid #e5e5e5", padding: "24px 0", flexShrink: 0, position: "relative" }}>
        <div style={{ padding: "0 20px 20px", borderBottom: "1px solid #eee", marginBottom: 12 }}>
          <span style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 800, color: "#111" }}>gelecek<span style={{ color: "#c73030" }}>finans</span></span>
          <p style={{ fontSize: 10, color: "#999", marginTop: 4, fontFamily: "var(--mono)", letterSpacing: ".08em", textTransform: "uppercase" }}>Admin Panel</p>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <SideLink href="/admin">Dashboard</SideLink>
          <SideLink href="/admin/makaleler">Makaleler</SideLink>
          <SideLink href="/admin/yeni">Yeni Makale</SideLink>
          <SideLink href="/admin/son-dakika">Son Dakika</SideLink>
          <SideLink href="/admin/analytics">Analytics</SideLink>
          <SideLink href="/admin/aboneler">Aboneler</SideLink>
          <SideLink href="/admin/bot">Bot Durumu</SideLink>
          <SideLink href="/admin/ayarlar">Ayarlar</SideLink>
        </nav>
        <div style={{ padding: "16px 20px", marginTop: "auto", borderTop: "1px solid #eee", position: "absolute", bottom: 0, width: 230 }}>
          <p style={{ fontSize: 11, color: "#999" }}>{session.user?.email}</p>
        </div>
      </aside>
      <main style={{ flex: 1, padding: 32, overflow: "auto" }}>
        {children}
      </main>
    </div>
  );
}

function SideLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{ padding: "10px 20px", fontSize: 13, color: "#666", transition: "color .15s" }}>
      {children}
    </Link>
  );
}
