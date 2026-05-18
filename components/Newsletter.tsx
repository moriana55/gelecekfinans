"use client";
import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div style={{ background: "var(--ink)", padding: "32px 24px", borderRadius: 6, textAlign: "center" }}>
        <p style={{ fontFamily: "var(--serif)", fontSize: 18, fontWeight: 700, color: "#fff" }}>Teşekkürler!</p>
        <p style={{ fontFamily: "var(--sans)", fontSize: 13, color: "#888", marginTop: 8 }}>Günlük bültenimize kaydoldunuz.</p>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--ink)", padding: "32px 24px", borderRadius: 6 }}>
      <p style={{ fontFamily: "var(--serif)", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
        Günlük Finans Bülteni
      </p>
      <p style={{ fontFamily: "var(--sans)", fontSize: 13, color: "#888", marginBottom: 16 }}>
        Her sabah piyasa özeti ve öne çıkan haberler e-postanızda.
      </p>
      <form onSubmit={subscribe} style={{ display: "flex", gap: 8 }}>
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="E-posta adresiniz" required
          style={{
            flex: 1, padding: "10px 14px", background: "#1a1a1a", border: "1px solid #333",
            borderRadius: 4, color: "#fff", fontSize: 13, fontFamily: "var(--sans)",
          }}
        />
        <button type="submit" disabled={status === "loading"}
          style={{
            padding: "10px 20px", background: "var(--accent)", color: "#fff", border: "none",
            borderRadius: 4, fontWeight: 600, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap",
          }}>
          {status === "loading" ? "..." : "Abone Ol"}
        </button>
      </form>
      {status === "error" && <p style={{ color: "#f87171", fontSize: 12, marginTop: 8 }}>Bir hata oluştu, tekrar deneyin.</p>}
    </div>
  );
}
