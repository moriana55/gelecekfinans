import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/giris");

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0a0a", color: "#eee" }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: "#111", borderRight: "1px solid #222", padding: "24px 0", flexShrink: 0 }}>
        <div style={{ padding: "0 20px 20px", borderBottom: "1px solid #222", marginBottom: 12 }}>
          <span style={{ fontFamily: "var(--serif)", fontSize: 16, fontWeight: 800 }}>gelecek<span style={{ color: "#f7931a" }}>finans</span></span>
          <p style={{ fontSize: 10, color: "#555", marginTop: 4 }}>Admin Panel</p>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <SideLink href="/admin">Dashboard</SideLink>
          <SideLink href="/admin/makaleler">Makaleler</SideLink>
          <SideLink href="/admin/yeni">Yeni Makale</SideLink>
          <SideLink href="/admin/son-dakika">Son Dakika</SideLink>
          <SideLink href="/admin/analytics">Analytics</SideLink>
          <SideLink href="/admin/bot">Bot Durumu</SideLink>
          <SideLink href="/admin/ayarlar">Ayarlar</SideLink>
        </nav>
        <div style={{ padding: "16px 20px", marginTop: "auto", borderTop: "1px solid #222", position: "absolute", bottom: 0, width: 220 }}>
          <p style={{ fontSize: 11, color: "#555" }}>{session.user?.email}</p>
        </div>
      </aside>
      {/* Main */}
      <main style={{ flex: 1, padding: 32, overflow: "auto" }}>
        {children}
      </main>
    </div>
  );
}

function SideLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{ padding: "10px 20px", fontSize: 13, color: "#aaa", transition: "color .15s" }}>
      {children}
    </Link>
  );
}
