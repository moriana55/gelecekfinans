"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Yatırım/Doviz tarzı yoğun, taranabilir PİYASA TABLOSU.
 * Mevcut canlı veri uçlarını (PriceBar → /api/fiyatlar, CryptoTicker → /api/kripto)
 * yeniden kullanır; farklı bir veri akışı kurmaz. Tüm hücreler için yükseklik
 * rezerve edilir → CLS yok. Her satır ilgili canlı veri sayfasına bağlanır.
 */

interface Fiyatlar {
  tcmb?: { usd?: { satis?: number }; eur?: { satis?: number }; gbp?: { satis?: number } };
  gold?: { price?: number; pct?: number };
  bist?: { price?: number; pct?: number };
  btc?: { price?: number; pct?: number };
}
interface Coin {
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

type Tab = "doviz" | "altin" | "kripto";

const TABS: { k: Tab; l: string; href: string }[] = [
  { k: "doviz", l: "Döviz", href: "/doviz" },
  { k: "altin", l: "Altın", href: "/altin" },
  { k: "kripto", l: "Kripto", href: "/kripto" },
];

function num(v: number, frac = 2) {
  return v.toLocaleString("tr-TR", { minimumFractionDigits: frac, maximumFractionDigits: frac });
}

function Pct({ v }: { v: number | null | undefined }) {
  if (v == null) return <span className="mb-pct mb-flat">—</span>;
  const up = v >= 0;
  return (
    <span className={`mb-pct ${up ? "mb-up" : "mb-dn"}`}>
      {up ? "▲" : "▼"} {Math.abs(v).toFixed(2)}%
    </span>
  );
}

interface Row {
  name: string;
  sub?: string;
  href: string;
  price?: number;
  pct?: number | null;
  prefix?: string;
  frac?: number;
}

function Table({ rows, all }: { rows: Row[]; all: { l: string; href: string } }) {
  return (
    <div className="mb-table" role="table" aria-label="Piyasa verileri">
      {rows.map((r) => (
        <Link key={r.name} href={r.href} className="mb-row" role="row">
          <span className="mb-name">
            {r.name}
            {r.sub && <span className="mb-sub">{r.sub}</span>}
          </span>
          <span className="mb-val">
            {r.price != null ? `${r.prefix ?? "₺"}${num(r.price, r.frac ?? 2)}` : "—"}
          </span>
          <Pct v={r.pct} />
        </Link>
      ))}
      <Link href={all.href} className="mb-all">
        {all.l} →
      </Link>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="mb-table" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="mb-row mb-row-skel">
          <span className="mb-skel mb-skel-name" />
          <span className="mb-skel mb-skel-val" />
          <span className="mb-skel mb-skel-pct" />
        </div>
      ))}
      <span className="mb-all mb-all-skel" />
    </div>
  );
}

export default function MarketBoard() {
  const [f, setF] = useState<Fiyatlar>({});
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<Tab>("doviz");

  useEffect(() => {
    const go = () => {
      fetch("/api/fiyatlar")
        .then((r) => r.json())
        .then((d: Fiyatlar) => setF(d))
        .catch(() => {})
        .finally(() => setLoaded(true));
      fetch("/api/kripto")
        .then((r) => r.json())
        .then((d: Coin[]) => Array.isArray(d) && setCoins(d))
        .catch(() => {});
    };
    go();
    const id = setInterval(go, 60000);
    return () => clearInterval(id);
  }, []);

  const doviz: Row[] = [
    { name: "Dolar", sub: "USD/TRY", href: "/doviz/usd-try", price: f.tcmb?.usd?.satis, prefix: "₺", frac: 4 },
    { name: "Euro", sub: "EUR/TRY", href: "/doviz/eur-try", price: f.tcmb?.eur?.satis, prefix: "₺", frac: 4 },
    { name: "Sterlin", sub: "GBP/TRY", href: "/doviz/gbp-try", price: f.tcmb?.gbp?.satis, prefix: "₺", frac: 4 },
    { name: "BIST 100", sub: "Endeks", href: "/doviz", price: f.bist?.price, pct: f.bist?.pct, prefix: "", frac: 0 },
  ];

  const altin: Row[] = [
    { name: "Gram Altın", sub: "24 ayar", href: "/altin/gram-altin", price: f.gold?.price, pct: f.gold?.pct },
    { name: "Çeyrek Altın", href: "/altin/ceyrek-altin", price: f.gold?.price ? f.gold.price * 1.75 : undefined, pct: f.gold?.pct },
    { name: "Cumhuriyet", sub: "Tam", href: "/altin/cumhuriyet-altini", price: f.gold?.price ? f.gold.price * 7.016 : undefined, pct: f.gold?.pct },
    { name: "Ons Altın", sub: "31.1 g", href: "/altin/ons", price: f.gold?.price ? f.gold.price * 31.1035 : undefined, pct: f.gold?.pct, frac: 0 },
  ];

  const kripto: Row[] = coins.slice(0, 4).map((c) => ({
    name: c.symbol?.toUpperCase() ?? "",
    href: "/kripto",
    price: c.current_price,
    pct: c.price_change_percentage_24h,
    frac: c.current_price >= 1000 ? 0 : 2,
  }));
  if (!kripto.length) {
    kripto.push({ name: "Bitcoin", sub: "BTC", href: "/kripto", price: f.btc?.price, pct: f.btc?.pct, frac: 0 });
  }

  return (
    <section className="market-board" aria-label="Canlı piyasa verileri">
      <div className="mb-head">
        <span className="mb-eyebrow">
          <span className="mb-live" aria-hidden /> Canlı Piyasa
        </span>
        <div className="mb-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.k}
              role="tab"
              aria-selected={tab === t.k}
              className={`mb-tab${tab === t.k ? " on" : ""}`}
              onClick={() => setTab(t.k)}
            >
              {t.l}
            </button>
          ))}
        </div>
        <span className="mb-updated">60 sn’de bir güncellenir</span>
      </div>

      {/* Masaüstü: üç tablo yan yana. Mobil: aktif sekme. */}
      <div className="mb-grid">
        <div className={`mb-col${tab === "doviz" ? " mb-col-active" : ""}`}>
          <div className="mb-col-title">Döviz Kurları</div>
          {loaded ? <Table rows={doviz} all={{ l: "Tüm döviz kurları", href: "/doviz" }} /> : <Skeleton />}
        </div>
        <div className={`mb-col${tab === "altin" ? " mb-col-active" : ""}`}>
          <div className="mb-col-title">Altın Fiyatları</div>
          {loaded ? <Table rows={altin} all={{ l: "Tüm altın fiyatları", href: "/altin" }} /> : <Skeleton />}
        </div>
        <div className={`mb-col${tab === "kripto" ? " mb-col-active" : ""}`}>
          <div className="mb-col-title">Kripto Para</div>
          {loaded ? <Table rows={kripto} all={{ l: "Tüm kripto fiyatları", href: "/kripto" }} /> : <Skeleton />}
        </div>
      </div>
    </section>
  );
}
