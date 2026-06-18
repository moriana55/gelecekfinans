"use client";
import { useEffect, useState } from "react";
interface Coin{symbol:string;current_price:number;price_change_percentage_24h:number;image:string;}
export default function CryptoTicker(){
  const [coins,setCoins]=useState<Coin[]>([]);
  useEffect(()=>{
    const go=()=>fetch("/api/kripto").then(r=>r.json()).then(setCoins).catch(()=>{});
    go();const id=setInterval(go,60000);return()=>clearInterval(id);
  },[]);
  if(!coins.length)return null;
  const items=[...coins,...coins];
  return(
    <div className="ticker-wrap">
      <div className="ticker-belt">
        {items.map((c,i)=>{
          const pct=c.price_change_percentage_24h??0;
          const up=pct>=0;
          const price=c.current_price>=1000
            ?c.current_price.toLocaleString("tr-TR",{maximumFractionDigits:0})
            :c.current_price.toLocaleString("tr-TR",{minimumFractionDigits:2,maximumFractionDigits:4});
          return(
            <div key={i} className="ticker-item">
              <img src={c.image} alt={`${c.symbol} logosu`} loading="lazy" width={14} height={14} style={{width:14,height:14,borderRadius:"50%"}}/>
              <span className="t-sym">{c.symbol}</span>
              <span className="t-price">₺{price}</span>
              <span className={up?"t-up":"t-dn"}>{up?"+":""}{pct.toFixed(2)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
