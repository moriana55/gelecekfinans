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
    <div className="breaking-bar">
      <span className="breaking-badge">SON DAKİKA</span>
      {item.url ? (
        <a href={item.url} className="breaking-text">{item.text}</a>
      ) : (
        <span className="breaking-text">{item.text}</span>
      )}
      <button onClick={() => setDismissed(true)} className="breaking-close">
        ×
      </button>
    </div>
  );
}
