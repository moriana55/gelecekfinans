"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * "Piyasa Hareketleri" rayı — en çok yükselen / düşen kripto paralar.
 * CryptoTicker ile aynı uç noktayı (/api/kripto) yeniden kullanır; ayrı bir
 * veri akışı kurmaz. Yükseklik rezerve edilir → CLS yok. Stil: inline Tailwind
 * utility sınıfları (özel .mover-* CSS'ine bağlı değil).
 */
interface Coin {
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
}

function num(v: number) {
  return v >= 1000
    ? v.toLocaleString("tr-TR", { maximumFractionDigits: 0 })
    : v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function MoverRow({ c }: { c: Coin }) {
  const pct = c.price_change_percentage_24h ?? 0;
  const up = pct >= 0;
  return (
    <Link
      href="/kripto"
      className="grid min-h-[36px] grid-cols-[1fr_auto_auto] items-center gap-2.5 rounded-md px-1 py-2 transition-colors hover:bg-[color:var(--surface)]"
    >
      <span className="font-mono text-[12px] font-bold text-[color:var(--ink)]">{c.symbol?.toUpperCase()}</span>
      <span className="text-right font-mono text-[12px] tabular-nums text-[color:var(--ink2)]">₺{num(c.current_price)}</span>
      <span
        className={`min-w-[58px] text-right font-mono text-[11.5px] font-semibold tabular-nums ${up ? "text-emerald-700" : "text-red-600"}`}
      >
        {up ? "+" : ""}
        {pct.toFixed(2)}%
      </span>
    </Link>
  );
}

function SkelGroup() {
  return (
    <div className="flex flex-col gap-2 py-1">
      <span className="h-3.5 animate-pulse rounded bg-[color:var(--surface2)]" />
      <span className="h-3.5 animate-pulse rounded bg-[color:var(--surface2)]" />
      <span className="h-3.5 animate-pulse rounded bg-[color:var(--surface2)]" />
    </div>
  );
}

export default function MoversRail() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const go = () =>
      fetch("/api/kripto")
        .then((r) => r.json())
        .then((d: Coin[]) => Array.isArray(d) && setCoins(d))
        .catch(() => {})
        .finally(() => setLoaded(true));
    go();
    const id = setInterval(go, 60000);
    return () => clearInterval(id);
  }, []);

  const valid = coins.filter((c) => typeof c.price_change_percentage_24h === "number");
  const gainers = [...valid].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 3);
  const losers = [...valid].sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h).slice(0, 3);

  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg)] px-[18px] pb-2 pt-4 shadow-sm">
      <div className="mb-1 border-b border-[color:var(--border2)] pb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
        Piyasa Hareketleri
      </div>
      <div className="py-1.5">
        <div className="mt-1.5 mb-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-700">
          Yükselenler
        </div>
        {loaded && gainers.length ? gainers.map((c) => <MoverRow key={c.symbol} c={c} />) : <SkelGroup />}
      </div>
      <div className="py-1.5">
        <div className="mt-1.5 mb-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-red-600">
          Düşenler
        </div>
        {loaded && losers.length ? losers.map((c) => <MoverRow key={c.symbol} c={c} />) : <SkelGroup />}
      </div>
    </div>
  );
}
