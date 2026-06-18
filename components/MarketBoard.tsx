"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Yatırım/Doviz tarzı yoğun, taranabilir PİYASA TABLOSU.
 * Mevcut canlı veri uçlarını (PriceBar → /api/fiyatlar, CryptoTicker → /api/kripto)
 * yeniden kullanır; farklı bir veri akışı kurmaz. Tüm hücreler için yükseklik
 * rezerve edilir → CLS yok. Her satır ilgili canlı veri sayfasına bağlanır.
 *
 * Stil: doğrudan Tailwind utility sınıfları (inline) + tasarım sistemi CSS
 * değişkenleri (:root içinde tanımlı). Özel .market-board CSS'ine bağlı DEĞİL,
 * böylece derleme/önbellek sorunlarında sessizce stilsiz kalamaz.
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
  const base = "inline-block min-w-[64px] text-right font-mono text-[11.5px] font-semibold tabular-nums";
  if (v == null) return <span className={`${base} text-slate-400`}>—</span>;
  const up = v >= 0;
  return (
    <span className={`${base} ${up ? "text-emerald-700" : "text-red-600"}`}>
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
    <div className="px-2 pb-2" role="table" aria-label="Piyasa verileri">
      {rows.map((r) => (
        <Link
          key={r.name}
          href={r.href}
          role="row"
          className="grid min-h-[40px] grid-cols-[1fr_auto_auto] items-center gap-2.5 rounded-lg px-2.5 py-2.5 transition-colors hover:bg-[color:var(--accent-soft)]"
        >
          <span className="flex min-w-0 items-baseline gap-1.5 text-[13.5px] font-semibold tracking-[-0.01em] text-[color:var(--ink)]">
            {r.name}
            {r.sub && (
              <span className="font-mono text-[10px] font-medium tracking-[0.02em] text-[color:var(--muted)]">{r.sub}</span>
            )}
          </span>
          <span className="text-right font-mono text-[13.5px] font-semibold tabular-nums text-[color:var(--ink)]">
            {r.price != null ? `${r.prefix ?? "₺"}${num(r.price, r.frac ?? 2)}` : "—"}
          </span>
          <Pct v={r.pct} />
        </Link>
      ))}
      <Link
        href={all.href}
        className="block px-2.5 pb-1.5 pt-2.5 font-mono text-[11px] font-semibold tracking-[0.04em] text-[color:var(--accent)] transition-colors hover:text-[color:var(--accent2)]"
      >
        {all.l} →
      </Link>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="px-2 pb-2" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="grid min-h-[40px] grid-cols-[1fr_auto_auto] items-center gap-2.5 px-2.5 py-2.5">
          <span className="block h-3 w-[70%] animate-pulse rounded bg-[color:var(--surface2)]" />
          <span className="ml-auto block h-3 w-[54px] animate-pulse rounded bg-[color:var(--surface2)]" />
          <span className="ml-auto block h-3 w-[46px] animate-pulse rounded bg-[color:var(--surface2)]" />
        </div>
      ))}
      <span className="mx-2.5 mb-1.5 mt-3.5 block h-3 w-[110px] animate-pulse rounded bg-[color:var(--surface2)]" />
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

  const colTitle =
    "px-[18px] pb-1.5 pt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]";

  return (
    <section
      className="my-6 overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--bg)] shadow-sm md:my-9"
      aria-label="Canlı piyasa verileri"
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2.5 md:gap-4 md:px-[18px] md:py-3">
        <span className="inline-flex items-center gap-2 whitespace-nowrap font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--accent-ink)]">
          <span className="h-[7px] w-[7px] animate-pulse rounded-full bg-emerald-700" aria-hidden /> Canlı Piyasa
        </span>
        <div className="inline-flex gap-1 md:hidden" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.k}
              role="tab"
              aria-selected={tab === t.k}
              onClick={() => setTab(t.k)}
              className={`cursor-pointer rounded-full border px-3 py-[5px] font-mono text-[11px] font-semibold tracking-[0.03em] transition-colors ${
                tab === t.k
                  ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white"
                  : "border-[color:var(--border2)] bg-[color:var(--bg)] text-[color:var(--muted)]"
              }`}
            >
              {t.l}
            </button>
          ))}
        </div>
        <span className="order-3 ml-0 w-full whitespace-nowrap font-mono text-[10px] tracking-[0.04em] text-[color:var(--muted)] md:order-none md:ml-auto md:w-auto">
          60 sn’de bir güncellenir
        </span>
      </div>

      {/* Masaüstü: üç tablo yan yana. Mobil: aktif sekme. */}
      <div className="grid grid-cols-1 md:grid-cols-3">
        <div
          className={`border-b border-[color:var(--border)] md:border-b-0 md:border-r ${tab === "doviz" ? "block" : "hidden md:block"}`}
        >
          <div className={`${colTitle} hidden md:block`}>Döviz Kurları</div>
          {loaded ? <Table rows={doviz} all={{ l: "Tüm döviz kurları", href: "/doviz" }} /> : <Skeleton />}
        </div>
        <div
          className={`border-b border-[color:var(--border)] md:border-b-0 md:border-r ${tab === "altin" ? "block" : "hidden md:block"}`}
        >
          <div className={`${colTitle} hidden md:block`}>Altın Fiyatları</div>
          {loaded ? <Table rows={altin} all={{ l: "Tüm altın fiyatları", href: "/altin" }} /> : <Skeleton />}
        </div>
        <div className={`${tab === "kripto" ? "block" : "hidden md:block"}`}>
          <div className={`${colTitle} hidden md:block`}>Kripto Para</div>
          {loaded ? <Table rows={kripto} all={{ l: "Tüm kripto fiyatları", href: "/kripto" }} /> : <Skeleton />}
        </div>
      </div>
    </section>
  );
}
