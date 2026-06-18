"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * "Piyasa Hareketleri" rayı — en çok yükselen / düşen kripto paralar.
 * CryptoTicker ile aynı uç noktayı (/api/kripto) yeniden kullanır; ayrı bir
 * veri akışı kurmaz. Yükseklik rezerve edilir → CLS yok.
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
    <Link href="/kripto" className="mover-row">
      <span className="mover-sym">{c.symbol?.toUpperCase()}</span>
      <span className="mover-price">₺{num(c.current_price)}</span>
      <span className={`mover-pct ${up ? "mb-up" : "mb-dn"}`}>
        {up ? "+" : ""}
        {pct.toFixed(2)}%
      </span>
    </Link>
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
    <div className="rail-card">
      <div className="rail-head">Piyasa Hareketleri</div>
      <div className="mover-group">
        <div className="mover-label mover-label-up">Yükselenler</div>
        {loaded && gainers.length ? (
          gainers.map((c) => <MoverRow key={c.symbol} c={c} />)
        ) : (
          <div className="mover-skel-group">
            <span className="mover-skel" />
            <span className="mover-skel" />
            <span className="mover-skel" />
          </div>
        )}
      </div>
      <div className="mover-group">
        <div className="mover-label mover-label-dn">Düşenler</div>
        {loaded && losers.length ? (
          losers.map((c) => <MoverRow key={c.symbol} c={c} />)
        ) : (
          <div className="mover-skel-group">
            <span className="mover-skel" />
            <span className="mover-skel" />
            <span className="mover-skel" />
          </div>
        )}
      </div>
    </div>
  );
}
