"use client";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface Props {
  position: "headerBanner" | "inArticle" | "sidebar" | "afterArticle";
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export default function AdSlot({ position }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [adsenseId, setAdsenseId] = useState("");
  const pushed = useRef(false);

  useEffect(() => {
    fetch("/api/site-config")
      .then(r => r.json())
      .then(d => {
        if (d.adSlots?.[position]) setEnabled(true);
        if (d.adsenseId) setAdsenseId(d.adsenseId);
      })
      .catch(() => {});
  }, [position]);

  // Reklam slotunu yalnızca etkin + adsenseId hazır olduğunda, bir kez kayıt et.
  useEffect(() => {
    if (!enabled || !adsenseId || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      /* AdSense betiği henüz yüklenmediyse onLoad sonrası yeniden denenir */
    }
  }, [enabled, adsenseId]);

  if (!enabled || !adsenseId) return null;

  return (
    // CLS-güvenli kapsayıcı (min-height globals.css'te) — yapı korunuyor.
    <div className={`ad-slot ${position === "headerBanner" ? "ad-slot-sm" : "ad-slot-lg"}`}>
      <Script
        id="adsbygoogle-loader"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
        strategy="afterInteractive"
        crossOrigin="anonymous"
        onLoad={() => {
          if (pushed.current) return;
          try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            pushed.current = true;
          } catch {
            /* no-op */
          }
        }}
      />
      <ins className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adsenseId}
        data-ad-slot=""
        data-ad-format="auto"
        data-full-width-responsive="true" />
    </div>
  );
}
