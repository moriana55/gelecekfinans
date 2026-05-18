"use client";
import { useEffect, useState } from "react";

interface BN { text: string; url?: string | null; }

export default function BreakingNews() {
  const [item, setItem] = useState<BN | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/breaking-news").then(r => r.json()).then(d => { if (d) setItem(d); });
  }, []);

  if (!item || dismissed) return null;

  return (
    <div style={{
      background: "#b91c1c", color: "#fff", padding: "8px 24px",
      display: "flex", alignItems: "center", gap: 12, fontSize: 13,
      fontFamily: "var(--sans)", fontWeight: 500, position: "relative",
    }}>
      <span style={{
        fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700,
        background: "#fff", color: "#b91c1c", padding: "2px 6px",
        borderRadius: 2, letterSpacing: ".1em", flexShrink: 0,
      }}>
        SON DAKİKA
      </span>
      {item.url ? (
        <a href={item.url} style={{ color: "#fff", flex: 1 }}>{item.text}</a>
      ) : (
        <span style={{ flex: 1 }}>{item.text}</span>
      )}
      <button onClick={() => setDismissed(true)}
        style={{ background: "none", border: "none", color: "#fff9", cursor: "pointer", fontSize: 16, padding: "0 4px" }}>
        ×
      </button>
    </div>
  );
}
