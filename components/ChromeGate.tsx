"use client";
import { usePathname } from "next/navigation";

/**
 * Public site chrome'unu (Navbar, footer, ticker, son dakika) yalnızca
 * herkese-açık sayfalarda gösterir. /admin altındaki sayfalar (giriş + panel)
 * kendi standalone düzenini kullanır; bu yüzden orada chrome gizlenir.
 */
export default function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
