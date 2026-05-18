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
    <div style={{
      margin: "24px 0", padding: 16, background: "var(--ground2)",
      border: "1px dashed var(--rule)", borderRadius: 4, textAlign: "center",
      minHeight: position === "headerBanner" ? 90 : 250,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <ins className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adsenseId}
        data-ad-slot=""
        data-ad-format="auto"
        data-full-width-responsive="true" />
    </div>
  );
}
