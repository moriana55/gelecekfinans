import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
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

// Modern fintech tipografi: güçlü grotesk başlık/gövde + monospace rakamlar.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800", "900"],
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: { default: "GelecekFinans — Finans & Ekonomi Haberleri", template: "%s | GelecekFinans" },
  description: "Borsa, döviz, kripto para, altın ve ekonomi alanında güncel haberler ve analizler.",
  // İkonlar dosya tabanlı convention ile sunulur: app/icon.svg (favicon) ve
  // app/apple-icon.tsx (apple touch). Next bunları otomatik olarak <head>'e
  // ekler; bu yüzden burada açık `icons` tanımı yok (icon.svg öncelikli).
  robots: { index: true, follow: true },
  metadataBase: new URL(BASE),
  alternates: { types: { "application/rss+xml": "/feed.xml" } },
  other: { "theme-color": "#ffffff", "apple-mobile-web-app-capable": "yes" },
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
    <html lang="tr" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="pb-ticker">
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({
          "@context":"https://schema.org","@type":"WebSite",
          name:"GelecekFinans",url:BASE,
          potentialAction:{"@type":"SearchAction",target:{
            "@type":"EntryPoint",urlTemplate:`${BASE}/?q={search_term_string}`
          },"query-input":"required name=search_term_string"}
        })}}/>
        <GoogleAnalytics />
        <a href="#main" className="skip-link">İçeriğe geç</a>
        <BreakingNews />
        <PriceBar />
        <Navbar />
        <main id="main">{children}</main>
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
