"use client";
import { useEffect, useState } from "react";
export default function PriceBar() {
  const [p, setP] = useState<any>({});
  useEffect(() => {
    const go = () => fetch("/api/fiyatlar").then(r => r.json()).then(setP).catch(() => {});
    go(); const id = setInterval(go, 60000); return () => clearInterval(id);
  }, []);
  const items = [
    { l: "DOLAR",    v: p.tcmb?.usd?.satis },
    { l: "EURO",     v: p.tcmb?.eur?.satis },
    { l: "POUND",    v: p.tcmb?.gbp?.satis },
    { l: "ALTIN",    v: p.gold?.price, pct: p.gold?.pct },
    { l: "BIST 100", v: p.bist?.price, pct: p.bist?.pct, raw: true },
    { l: "BTC",      v: p.btc?.price,  pct: p.btc?.pct },
  ].filter(i => i.v);
  return (
    <div className="pbar">
      <div className="pbar-scroll">
        {items.map(i => {
          const up = !i.pct || i.pct >= 0;
          return (
            <div key={i.l} className="pbar-item">
              <span className="pbar-lbl">{i.l}</span>
              <span className="pbar-val">{!i.raw && "₺"}{i.v!.toLocaleString("tr-TR",{minimumFractionDigits:i.raw?0:2,maximumFractionDigits:2})}</span>
              {i.pct !== undefined && <span className={up?"up":"dn"}>{up?"▲":"▼"} {Math.abs(i.pct).toFixed(2)}%</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
