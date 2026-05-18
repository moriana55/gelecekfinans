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
      <body style={{ paddingBottom: 36 }}>
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
        {children}
        <footer style={{ background: "#111", color: "#ccc", padding: "40px 24px 24px", fontSize: 12, marginTop: 60 }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: "12px 32px", justifyContent: "center", marginBottom: 16 }}>
            <Link href="/hakkimizda" style={{ color: "#999" }}>Hakkımızda</Link>
            <Link href="/iletisim" style={{ color: "#999" }}>İletişim</Link>
            <Link href="/gizlilik-politikasi" style={{ color: "#999" }}>Gizlilik Politikası</Link>
            <Link href="/kullanim-kosullari" style={{ color: "#999" }}>Kullanım Koşulları</Link>
            <a href="/feed.xml" style={{ color: "#999" }}>RSS</a>
          </div>
          <p style={{ textAlign: "center", color: "#555" }}>
            © {new Date().getFullYear()} GelecekFinans — Yayınlanan içerikler bilgi amaçlıdır, yatırım tavsiyesi değildir.
          </p>
        </footer>
        <CryptoTicker />
        <PageTracker />
        <Analytics />
      </body>
    </html>
  );
}
