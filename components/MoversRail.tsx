"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

/**
 * "Piyasa Hareketleri" rayı — en çok yükselen / düşen kripto paralar.
 * CryptoTicker ile aynı uç noktayı (/api/kripto) yeniden kullanır; ayrı bir
 * veri akışı kurmaz. Yükseklik rezerve edilir → CLS yok.
 *
 * NOT: INLINE STYLE kullanır — Tailwind utility üretimi bu projede güvenilmez
 * çıktığı için (çok-lockfile workspace-root + v4 içerik taraması) gap/padding
 * sınıfları render'a yansımıyordu → "her şey dip dibe". Inline style hiçbir CSS
 * derleme koşuluna bağlı değil → boşluklar her zaman uygulanır.
 */
interface Coin {
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
}

const mono = "var(--mono), ui-monospace, monospace";

function num(v: number) {
  return v >= 1000
    ? v.toLocaleString("tr-TR", { maximumFractionDigits: 0 })
    : v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function MoverRow({ c, last }: { c: Coin; last: boolean }) {
  const pct = c.price_change_percentage_24h ?? 0;
  const up = pct >= 0;
  return (
    <Link
      href="/kripto"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto auto",
        alignItems: "center",
        gap: 12,
        minHeight: 40,
        padding: "11px 8px",
        textDecoration: "none",
        borderBottom: last ? "none" : "1px solid var(--border)",
      }}
    >
      <span style={{ fontFamily: mono, fontSize: 12.5, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--ink)" }}>
        {c.symbol?.toUpperCase()}
      </span>
      <span
        style={{
          fontFamily: mono,
          fontSize: 12.5,
          fontVariantNumeric: "tabular-nums",
          color: "var(--ink2)",
          textAlign: "right",
          whiteSpace: "nowrap",
        }}
      >
        ₺{num(c.current_price)}
      </span>
      <span
        style={{
          minWidth: 62,
          textAlign: "right",
          fontFamily: mono,
          fontSize: 12,
          fontWeight: 600,
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap",
          color: up ? "#15803d" : "#dc2626",
        }}
      >
        {up ? "+" : ""}
        {pct.toFixed(2)}%
      </span>
    </Link>
  );
}

function SkelGroup() {
  const bar: CSSProperties = {
    height: 14,
    borderRadius: 4,
    background: "var(--surface2)",
    display: "block",
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "12px 8px" }}>
      <span style={bar} />
      <span style={bar} />
      <span style={bar} />
    </div>
  );
}

const subLabel = (color: string): CSSProperties => ({
  fontFamily: mono,
  fontSize: 10,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color,
  margin: "14px 8px 6px",
});

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
    <div
      style={{
        borderRadius: 12,
        border: "1px solid var(--border)",
        background: "var(--paper)",
        boxShadow: "0 1px 2px rgba(15,23,42,.05)",
        padding: "16px 18px 12px",
      }}
    >
      <div
        style={{
          paddingBottom: 12,
          marginBottom: 4,
          borderBottom: "1px solid var(--border2)",
          fontFamily: mono,
          fontSize: 10,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.16em",
          color: "var(--accent)",
        }}
      >
        Piyasa Hareketleri
      </div>

      <div style={subLabel("#15803d")}>Yükselenler</div>
      {loaded && gainers.length ? (
        gainers.map((c, i) => <MoverRow key={c.symbol} c={c} last={i === gainers.length - 1} />)
      ) : (
        <SkelGroup />
      )}

      <div style={subLabel("#dc2626")}>Düşenler</div>
      {loaded && losers.length ? (
        losers.map((c, i) => <MoverRow key={c.symbol} c={c} last={i === losers.length - 1} />)
      ) : (
        <SkelGroup />
      )}
    </div>
  );
}
