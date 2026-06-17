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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  robots: { index: true, follow: true },
  metadataBase: new URL(BASE),
  alternates: { types: { "application/rss+xml": "/feed.xml" } },
  other: { "theme-color": "#111111", "apple-mobile-web-app-capable": "yes" },
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

const CATS = [
  { k: "kripto", l: "Kripto Para" },
  { k: "borsa", l: "Borsa" },
  { k: "doviz", l: "Döviz" },
  { k: "altin", l: "Altın" },
  { k: "ekonomi", l: "Ekonomi" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="pb-ticker">
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
        <footer className="footer">
          <div className="footer-grid">
            <div className="footer-col">
              <div className="footer-brand">gelecek<span>finans</span></div>
              <p className="footer-tagline">Finans & Ekonomi Haberleri</p>
              <p className="footer-desc">Borsa, döviz, kripto para, altın ve ekonomi alanında güncel haberler ve analizler.</p>
            </div>
            <div className="footer-col">
              <h4>Kategoriler</h4>
              {CATS.map(c => (
                <Link key={c.k} href={`/kategori/${c.k}`} className="footer-link">{c.l}</Link>
              ))}
            </div>
            <div className="footer-col">
              <h4>Şirket</h4>
              <Link href="/arsiv" className="footer-link">Haber Arşivi</Link>
              <Link href="/hakkimizda" className="footer-link">Hakkımızda</Link>
              <Link href="/iletisim" className="footer-link">İletişim</Link>
              <a href="/feed.xml" className="footer-link">RSS Beslemesi</a>
            </div>
            <div className="footer-col">
              <h4>Yasal</h4>
              <Link href="/gizlilik-politikasi" className="footer-link">Gizlilik Politikası</Link>
              <Link href="/kullanim-kosullari" className="footer-link">Kullanım Koşulları</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copyright">
              © {new Date().getFullYear()} GelecekFinans — Yayınlanan içerikler bilgi amaçlıdır, yatırım tavsiyesi değildir.
            </p>
            <div className="footer-social">
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>
        </footer>
        <CryptoTicker />
        <PageTracker />
        <Analytics />
      </body>
    </html>
  );
}
