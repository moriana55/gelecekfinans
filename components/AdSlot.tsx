"use client";
import { useEffect, useState } from "react";

interface Props {
  position: "headerBanner" | "inArticle" | "sidebar" | "afterArticle";
}

export default function AdSlot({ position }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [adsenseId, setAdsenseId] = useState("");

  useEffect(() => {
    fetch("/api/site-config")
      .then(r => r.json())
      .then(d => {
        if (d.adSlots?.[position]) setEnabled(true);
        if (d.adsenseId) setAdsenseId(d.adsenseId);
      })
      .catch(() => {});
  }, [position]);

  if (!enabled || !adsenseId) return null;

  return (
    <div className={`ad-slot ${position === "headerBanner" ? "ad-slot-sm" : "ad-slot-lg"}`}>
      <ins className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adsenseId}
        data-ad-slot=""
        data-ad-format="auto"
        data-full-width-responsive="true" />
    </div>
  );
}
