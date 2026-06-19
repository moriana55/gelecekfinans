import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminNav from "./AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/sys-k3m8p/giris");

  return (
    <div className="adm-shell">
      <aside className="adm-side">
        <div className="adm-brand">
          <span className="adm-brand-mk">GF</span>
          <div>
            <span className="adm-brand-name">Gelecek Finans</span>
            <span className="adm-brand-sub">Yönetim Paneli</span>
          </div>
        </div>

        <AdminNav />

        <div className="adm-foot">
          <p className="adm-user">{session.user?.email}</p>
          <Link className="adm-open-site" href="/" target="_blank">
            Siteyi Aç
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17 17 7M7 7h10v10" />
            </svg>
          </Link>
        </div>
      </aside>

      <main className="adm-main">
        <div className="adm-content">{children}</div>
      </main>
    </div>
  );
}
