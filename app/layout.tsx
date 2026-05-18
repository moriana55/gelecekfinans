import type { Metadata } from "next";
import "./globals.css";
import PriceBar from "@/components/PriceBar";
import Navbar from "@/components/Navbar";
import CryptoTicker from "@/components/CryptoTicker";
import BreakingNews from "@/components/BreakingNews";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import PageTracker from "@/components/PageTracker";
import { Analytics } from "@vercel/analytics/react";
import Link from "next/link";

const BASE = "https://gelecekfinans.com";

export const metadata: Metadata = {
  title: { default: "GelecekFinans — Finans & Ekonomi Haberleri", template: "%s | GelecekFinans" },
  description: "Borsa, döviz, kripto para, altın ve ekonomi alanında güncel haberler ve analizler.",
  robots: { index: true, follow: true },
  metadataBase: new URL(BASE),
  alternates: { types: { "application/rss+xml": "/feed.xml" } },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "GelecekFinans",
    title: "GelecekFinans — Finans & Ekonomi Haberleri",
    description: "Borsa, döviz, kripto para, altın ve ekonomi alanında güncel haberler ve analizler.",
    url: BASE,
  },
  twitter: {
    card: "summary_large_image",
    title: "GelecekFinans",
    description: "Borsa, döviz, kripto para, altın ve ekonomi alanında güncel haberler.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body style={{ paddingBottom: 40 }}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({
          "@context":"https://schema.org","@type":"WebSite",
          name:"GelecekFinans",url:BASE,
          potentialAction:{"@type":"SearchAction",target:{
            "@type":"EntryPoint",urlTemplate:`${BASE}/?q={search_term_string}`
          },"query-input":"required name=search_term_string"}
        })}}/>
        <GoogleAnalytics />
        <BreakingNews />
        <PriceBar />
        <Navbar />
        <main>{children}</main>
        <footer style={{
          background: "#060607",
          borderTop: "1px solid rgba(255,255,255,.06)",
          padding: "48px 28px 28px",
          marginTop: 80,
        }}>
          <div style={{
            maxWidth: 1320, margin: "0 auto",
            display: "grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems: "start",
          }}>
            <div>
              <div style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 700, color: "#f0f0f2", marginBottom: 4 }}>
                gelecek<span style={{ color: "#d4a853" }}>finans</span>
              </div>
              <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#6b6b78", letterSpacing: ".12em", textTransform: "uppercase" }}>
                Finans & Ekonomi Haberleri
              </p>
            </div>
            <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
              <Link href="/hakkimizda" style={{ fontFamily: "var(--sans)", fontSize: 13, color: "#6b6b78", transition: "color .2s" }}>Hakkımızda</Link>
              <Link href="/iletisim" style={{ fontFamily: "var(--sans)", fontSize: 13, color: "#6b6b78", transition: "color .2s" }}>İletişim</Link>
              <Link href="/gizlilik-politikasi" style={{ fontFamily: "var(--sans)", fontSize: 13, color: "#6b6b78", transition: "color .2s" }}>Gizlilik</Link>
              <Link href="/kullanim-kosullari" style={{ fontFamily: "var(--sans)", fontSize: 13, color: "#6b6b78", transition: "color .2s" }}>Kullanım Koşulları</Link>
              <a href="/feed.xml" style={{ fontFamily: "var(--sans)", fontSize: 13, color: "#6b6b78", transition: "color .2s" }}>RSS</a>
            </div>
          </div>
          <div style={{
            maxWidth: 1320, margin: "0 auto",
            borderTop: "1px solid rgba(255,255,255,.06)",
            marginTop: 32, paddingTop: 20,
          }}>
            <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "#3a3a44", textAlign: "center", letterSpacing: ".04em" }}>
              © {new Date().getFullYear()} GelecekFinans — Yayınlanan içerikler bilgi amaçlıdır, yatırım tavsiyesi değildir.
            </p>
          </div>
        </footer>
        <CryptoTicker />
        <PageTracker />
        <Analytics />
      </body>
    </html>
  );
}
