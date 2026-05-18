"use client";
import { useEffect, useState } from "react";

interface BN { text: string; url?: string | null; }

export default function BreakingNews() {
  const [item, setItem] = useState<BN | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/breaking-news").then(r => r.json()).then(d => { if (d) setItem(d); }).catch(() => {});
  }, []);

  if (!item || dismissed) return null;

  return (
    <div style={{
      background: "#dc2626", color: "#fff", padding: "8px 28px",
      display: "flex", alignItems: "center", gap: 12, fontSize: 13,
      fontFamily: "var(--sans)", fontWeight: 500,
    }}>
      <span style={{
        fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
        background: "rgba(255,255,255,.15)", color: "#fff", padding: "3px 8px",
        borderRadius: 3, letterSpacing: ".08em", flexShrink: 0,
      }}>
        SON DAKİKA
      </span>
      {item.url ? (
        <a href={item.url} style={{ color: "#fff", flex: 1 }}>{item.text}</a>
      ) : (
        <span style={{ flex: 1 }}>{item.text}</span>
      )}
      <button onClick={() => setDismissed(true)}
        style={{ background: "none", border: "none", color: "rgba(255,255,255,.6)", cursor: "pointer", fontSize: 18, padding: "0 4px" }}>
        ×
      </button>
    </div>
  );
}
